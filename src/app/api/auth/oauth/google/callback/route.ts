import { NextRequest, NextResponse } from "next/server";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/persistence/user.repository";
import { DrizzleSessionRepository } from "@/modules/auth/infrastructure/persistence/session.repository";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { Entity } from "@/shared/domain/base-entity";
import { Email } from "@/modules/users/domain/value-objects/email.vo";
import { UserRole } from "@/modules/users/domain/value-objects/user-role.vo";
import { UserStatus } from "@/modules/users/domain/value-objects/user-status.vo";
import { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import {
  generateSessionToken,
  hashToken,
  getSessionExpiry,
  COOKIE_NAME,
  SESSION_DURATION_DAYS_EXPORT,
} from "@/shared/infrastructure/auth/token";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const userRepo = new DrizzleUserRepository();
const sessionRepo = new DrizzleSessionRepository();

interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

function loginError(req: NextRequest, code: string): NextResponse {
  const res = NextResponse.redirect(new URL(`/login?error=${code}`, req.url));
  res.cookies.delete("oauth_state");
  return res;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  // User cancelled or Google returned an error
  if (oauthError || !code) {
    return loginError(req, "oauth_cancelled");
  }

  // CSRF: verify state matches the cookie we set during initiation
  const storedState = req.cookies.get("oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    return loginError(req, "oauth_state_mismatch");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/oauth/google/callback`;

  // Exchange authorization code for access token
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  }).catch(() => null);

  if (!tokenRes?.ok) return loginError(req, "oauth_token_exchange");

  const { access_token } = (await tokenRes.json()) as { access_token: string };

  // Fetch Google user profile
  const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  }).catch(() => null);

  if (!userInfoRes?.ok) return loginError(req, "oauth_userinfo");

  const googleUser = (await userInfoRes.json()) as GoogleUserInfo;

  if (!googleUser.email || !googleUser.email_verified) {
    return loginError(req, "oauth_email_unverified");
  }

  // Find or create user by email
  const existingResult = await userRepo.findByEmail(googleUser.email);
  if (!existingResult.success) return loginError(req, "oauth_db_error");

  let user = existingResult.data;

  if (!user) {
    // New user — provision account (no password credential needed)
    const emailResult = Email.create(googleUser.email);
    const roleResult = UserRole.create("viewer");
    const statusResult = UserStatus.create("active");

    if (!emailResult.success || !roleResult.success || !statusResult.success) {
      return loginError(req, "oauth_create_user");
    }

    const newUser = UserEntity.create({
      id: Entity.generateId(),
      email: emailResult.data,
      name: googleUser.name,
      avatarUrl: googleUser.picture ?? null,
      role: roleResult.data,
      status: statusResult.data,
      lastLoginAt: null,
    });

    const saveResult = await userRepo.save(newUser);
    if (!saveResult.success) return loginError(req, "oauth_save_user");
    user = saveResult.data;
  }

  if (user.status.value === "suspended") {
    return loginError(req, "account_suspended");
  }

  // Update last login and persist avatar from Google if not already set
  user.recordLogin();
  await userRepo.save(user);

  // Issue a new session (same split-token pattern as email/password login)
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const session = SessionEntity.create({
    id: Entity.generateId(),
    userId: user.id,
    tokenHash,
    ipAddress: ip,
    userAgent: req.headers.get("user-agent") ?? null,
    expiresAt: getSessionExpiry(),
    lastActiveAt: new Date(),
  });

  const sessionResult = await sessionRepo.create(session);
  if (!sessionResult.success) return loginError(req, "oauth_session");

  // Set session cookie and redirect to dashboard
  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.delete("oauth_state");
  res.cookies.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS_EXPORT * 24 * 60 * 60,
  });

  return res;
}
