'use server'

import { desc } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/client'
import { documentsTable } from '@/modules/documents/infrastructure/persistence/schema'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'documents-queries' })

export interface RecentDocumentDTO {
  id: string
  title: string
  type: string
  status: string
  updatedAt: string
}

/**
 * Returns the 5 most recently updated documents for the nav sidebar.
 * @returns Array of RecentDocumentDTO
 */
export async function getRecentDocuments(): Promise<RecentDocumentDTO[]> {
  try {
    const rows = await db
      .select({
        id: documentsTable.id,
        title: documentsTable.title,
        type: documentsTable.type,
        status: documentsTable.status,
        updatedAt: documentsTable.updatedAt,
      })
      .from(documentsTable)
      .orderBy(desc(documentsTable.updatedAt))
      .limit(5)

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      status: row.status,
      updatedAt: row.updatedAt.toISOString(),
    }))
  } catch (error) {
    log.error({ error }, 'getRecentDocuments failed')
    return []
  }
}
