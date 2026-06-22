import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/shared/infrastructure/auth/session'
import { DrizzleChatAttachmentRepository } from '@/modules/chat/infrastructure/persistence/chat-attachment.repository'

const attachmentRepo = new DrizzleChatAttachmentRepository()

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const serverSession = await getServerSession()
  if (!serverSession) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  const { user } = serverSession

  const { id } = await params
  const result = await attachmentRepo.findById(id)
  if (!result.success || !result.data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const attachment = result.data
  const isAdmin = user.role.value === 'admin'
  const isParticipant = attachment.chatUserId === user.id || attachment.uploaderId === user.id
  if (!isAdmin && !isParticipant) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return new NextResponse(new Uint8Array(attachment.data), {
    headers: {
      'Content-Type': attachment.mimeType,
      'Content-Length': String(attachment.size),
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const serverSession = await getServerSession()
  if (!serverSession) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  if (serverSession.user.role.value !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const { id } = await params
  const result = await attachmentRepo.delete(id)
  if (!result.success) {
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
