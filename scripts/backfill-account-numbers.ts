/**
 * Backfill script — assigns a unique 10-digit bank account number
 * to every existing user that doesn't have one yet.
 *
 * Run once after the `account_number` migration:
 *   pnpm tsx scripts/backfill-account-numbers.ts
 */

import * as fs from "fs";
import * as path from "path";
import postgres from "postgres";

// ── Load .env manually (no dotenv dependency needed) ─────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set in .env");
  process.exit(1);
}

// ── Account number generator ──────────────────────────────────────────────────
function generateAccountNumber(): string {
  return String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const sql = postgres(DATABASE_URL!, { max: 1 });

  try {
    // Fetch all users without an account number
    const users = await sql<{ id: string; name: string }[]>`
      SELECT id, name
      FROM users
      WHERE account_number IS NULL
      ORDER BY created_at
    `;

    if (users.length === 0) {
      console.log("✅  All users already have an account number. Nothing to do.");
      return;
    }

    console.log(`Found ${users.length} user(s) without an account number. Backfilling…\n`);

    // Fetch existing account numbers to avoid collisions
    const existing = await sql<{ account_number: string }[]>`
      SELECT account_number FROM users WHERE account_number IS NOT NULL
    `;
    const taken = new Set(existing.map((r) => r.account_number));

    let updated = 0;
    for (const user of users) {
      // Generate a number that isn't already in use
      let acctNo: string;
      let attempts = 0;
      do {
        acctNo = generateAccountNumber();
        attempts++;
        if (attempts > 1000) throw new Error("Too many collisions generating account numbers");
      } while (taken.has(acctNo));

      taken.add(acctNo); // reserve it for subsequent iterations

      await sql`
        UPDATE users
        SET account_number = ${acctNo}
        WHERE id = ${user.id}
      `;

      console.log(`  ✓  ${user.name.padEnd(30)} → ${acctNo.slice(0, 4)} ${acctNo.slice(4, 7)} ${acctNo.slice(7)}`);
      updated++;
    }

    console.log(`\n✅  Done — ${updated} user(s) updated.`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("❌  Script failed:", err.message);
  process.exit(1);
});
