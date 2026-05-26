import { db } from '@/shared/infrastructure/database/client'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'
import { documentsTable } from '@/modules/documents/infrastructure/persistence/schema'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'seed:documents' })

type DocType = 'report' | 'presentation' | 'spreadsheet' | 'contract' | 'other'
type DocStatus = 'draft' | 'review' | 'published'

const DOCUMENTS: Array<{ title: string; type: DocType; status: DocStatus }> = [
  { title: 'Q2 2025 Financial Report', type: 'report', status: 'published' },
  { title: 'Annual Compliance Review', type: 'report', status: 'published' },
  { title: 'Board Deck — Series C', type: 'presentation', status: 'review' },
  { title: 'Payment Rails Analysis', type: 'spreadsheet', status: 'published' },
  { title: 'Vendor Agreement — Stripe', type: 'contract', status: 'published' },
  { title: 'Q3 Revenue Forecast', type: 'spreadsheet', status: 'draft' },
  { title: 'Engineering Roadmap H2', type: 'presentation', status: 'review' },
  { title: 'MSA — Atlas Components', type: 'contract', status: 'published' },
  { title: 'Fraud Detection Summary', type: 'report', status: 'published' },
  { title: 'Treasury Policy v3', type: 'report', status: 'review' },
  { title: 'Investor Update — May', type: 'presentation', status: 'published' },
  { title: 'Payroll Reconciliation', type: 'spreadsheet', status: 'published' },
  { title: 'SOC 2 Type II Report', type: 'report', status: 'published' },
  { title: 'API Pricing Model', type: 'spreadsheet', status: 'draft' },
  { title: 'NDA — Lumen Labs', type: 'contract', status: 'published' },
  { title: 'OKRs Q3 Deck', type: 'presentation', status: 'draft' },
  { title: 'Cash Flow Projection', type: 'spreadsheet', status: 'review' },
  { title: 'AML/KYC Policy', type: 'report', status: 'published' },
  { title: 'Product Launch Brief', type: 'presentation', status: 'review' },
  { title: 'Data Processing Agreement', type: 'contract', status: 'draft' },
  { title: 'FX Exposure Report', type: 'report', status: 'published' },
  { title: 'Infrastructure Cost Model', type: 'spreadsheet', status: 'published' },
  { title: 'Partnership Deck — Visa', type: 'presentation', status: 'draft' },
  { title: 'Enterprise MSA Template', type: 'contract', status: 'review' },
  { title: 'Monthly Active Users Report', type: 'report', status: 'published' },
  { title: 'Capex Budget 2025', type: 'spreadsheet', status: 'draft' },
  { title: 'Security Audit Summary', type: 'report', status: 'published' },
  { title: 'GDPR Compliance Checklist', type: 'other', status: 'published' },
  { title: 'Ops Runbook — Incident Response', type: 'other', status: 'published' },
  { title: 'Headcount Plan H2 2025', type: 'spreadsheet', status: 'review' },
]

/**
 * Seeds 30 documents across realistic types and statuses.
 */
export async function seedDocuments(): Promise<void> {
  log.info('Seeding documents…')

  const allUsers = await db.select({ id: usersTable.id }).from(usersTable)
  if (allUsers.length === 0) {
    log.warn('No users found — seed users first')
    return
  }

  await db.delete(documentsTable)

  const rows = DOCUMENTS.map((doc, i) => ({
    title: doc.title,
    type: doc.type,
    status: doc.status,
    description: `${doc.title} — internal document`,
    ownerId: allUsers[i % allUsers.length].id,
  }))

  await db.insert(documentsTable).values(rows)
  log.info({ count: rows.length }, 'Documents seeded')
}
