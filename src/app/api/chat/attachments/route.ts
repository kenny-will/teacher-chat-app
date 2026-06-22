import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/shared/infrastructure/auth/session'
import { DrizzleUserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { DrizzleChatAttachmentRepository } from '@/modules/chat/infrastructure/persistence/chat-attachment.repository'

const userRepo = new DrizzleUserRepository()
const attachmentRepo = new DrizzleChatAttachmentRepository()

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const serverSession = await getServerSession()
  if (!serverSession) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  const { user } = serverSession

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  const chatUserId = form?.get('chatUserId')
  if (!(file instanceof File) || typeof chatUserId !== 'string' || !chatUserId) {
    return NextResponse.json({ error: 'file and chatUserId are required' }, { status: 400 })
  }

  // Regular users may only attach images to their own thread; admins may attach to any.
  const isAdmin = user.role.value === 'admin'
  if (!isAdmin && chatUserId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (isAdmin && chatUserId !== user.id) {
    const targetResult = await userRepo.findById(chatUserId)
    if (!targetResult.success || !targetResult.data) {
      return NextResponse.json({ error: 'Chat user not found' }, { status: 404 })
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return NextResponse.json({ error: 'File is too large (5MB max)' }, { status: 400 })
  }

  const data = Buffer.from(await file.arrayBuffer())
  const result = await attachmentRepo.create({
    chatUserId,
    uploaderId: user.id,
    mimeType: file.type,
    size: file.size,
    data,
  })
  if (!result.success) {
    return NextResponse.json({ error: 'Failed to store attachment' }, { status: 500 })
  }

  return NextResponse.json(result.data)
}
