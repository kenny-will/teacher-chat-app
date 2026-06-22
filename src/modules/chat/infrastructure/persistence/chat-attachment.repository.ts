import { eq } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/client'
import { chatAttachmentsTable } from './schema'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'chat-attachment-repository' })

export interface ChatAttachmentMeta {
  id: string
  chatUserId: string
  uploaderId: string
  mimeType: string
  size: number
}

export interface ChatAttachmentFile extends ChatAttachmentMeta {
  data: Buffer
}

export class DrizzleChatAttachmentRepository {
  /**
   * Stores an uploaded image and returns its metadata (without the bytes).
   */
  async create(params: {
    chatUserId: string
    uploaderId: string
    mimeType: string
    size: number
    data: Buffer
  }): Promise<Result<ChatAttachmentMeta>> {
    try {
      const [row] = await db
        .insert(chatAttachmentsTable)
        .values(params)
        .returning({
          id: chatAttachmentsTable.id,
          chatUserId: chatAttachmentsTable.chatUserId,
          uploaderId: chatAttachmentsTable.uploaderId,
          mimeType: chatAttachmentsTable.mimeType,
          size: chatAttachmentsTable.size,
        })
      return ok(row)
    } catch (error) {
      log.error({ error, chatUserId: params.chatUserId }, 'create failed')
      return err(new Error('Failed to store chat attachment', { cause: error }))
    }
  }

  /**
   * Fetches the full attachment, including bytes, for serving back to the client.
   */
  async findById(id: string): Promise<Result<ChatAttachmentFile | null>> {
    try {
      const [row] = await db
        .select()
        .from(chatAttachmentsTable)
        .where(eq(chatAttachmentsTable.id, id))
        .limit(1)
      if (!row) return ok(null)
      return ok({
        id: row.id,
        chatUserId: row.chatUserId,
        uploaderId: row.uploaderId,
        mimeType: row.mimeType,
        size: row.size,
        data: row.data,
      })
    } catch (error) {
      log.error({ error, id }, 'findById failed')
      return err(new Error('Failed to load chat attachment', { cause: error }))
    }
  }

  /**
   * Deletes a stored attachment, e.g. when its message is removed.
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      await db.delete(chatAttachmentsTable).where(eq(chatAttachmentsTable.id, id))
      return ok(undefined)
    } catch (error) {
      log.error({ error, id }, 'delete failed')
      return err(new Error('Failed to delete chat attachment', { cause: error }))
    }
  }
}
