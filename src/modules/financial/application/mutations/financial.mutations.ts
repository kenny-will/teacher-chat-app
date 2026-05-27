'use server'

import { getServerSession } from '@/shared/infrastructure/auth/session'
import * as repo from '@/modules/financial/infrastructure/persistence/financial.repository'
import { db } from '@/shared/infrastructure/database/client'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'
import { eq, count } from 'drizzle-orm'

async function requireAdmin(): Promise<string> {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthenticated')
  if (session.user.role.value !== 'admin') throw new Error('Forbidden: admin only')
  return session.user.id
}

async function requireUserId(): Promise<string> {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthenticated')
  return session.user.id
}

function nowLabel(): string {
  const now = new Date()
  return (
    now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  )
}

/** User: submit a withdrawal request (creates Pending outbound transaction). */
export async function userRequestWithdrawal(params: {
  description: string
  category: string
  amountUsd: number
  accountRef: string
}): Promise<void> {
  const userId = await requireUserId()
  await repo.insertTransaction({
    userId,
    description:     params.description,
    category:        params.category,
    amount:          `−$${params.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    direction:       'outbound',
    transactionDate: nowLabel(),
    accountRef:      params.accountRef,
    status:          'Pending',
    statusTone:      'amber',
    sortOrder:       -1,
  })
}

/** User: submit a deposit request (creates Pending inbound transaction). */
export async function userRequestDeposit(params: {
  description: string
  category: string
  amountUsd: number
  accountRef: string
}): Promise<void> {
  const userId = await requireUserId()
  await repo.insertTransaction({
    userId,
    description:     params.description,
    category:        params.category,
    amount:          `+$${params.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    direction:       'inbound',
    transactionDate: nowLabel(),
    accountRef:      params.accountRef,
    status:          'Pending',
    statusTone:      'amber',
    sortOrder:       -1,
  })
}

/** Admin: seed all demo financial data for a specific user. */
export async function adminSeedDemoData(userId: string): Promise<void> {
  await requireAdmin()
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1)
  if (!user) throw new Error('User not found')
  await repo.seedDemoFinancialData(userId, user.name)
}

/** Admin: wipe all financial data for a specific user. */
export async function adminClearUserData(userId: string): Promise<void> {
  await requireAdmin()
  await repo.clearUserFinancialData(userId)
}

/** Admin: get all transactions across all users (with user name/email joined). */
export async function adminGetAllTransactions() {
  await requireAdmin()
  return repo.getAllTransactionsWithUsers()
}

/** Admin: change a user's role (promote/demote). */
export async function adminChangeUserRole(
  targetUserId: string,
  newRole: 'viewer' | 'editor' | 'admin',
): Promise<void> {
  const adminId = await requireAdmin()
  if (targetUserId === adminId) throw new Error('You cannot change your own role')

  // Prevent removing the last admin
  if (newRole !== 'admin') {
    const [row] = await db
      .select({ total: count() })
      .from(usersTable)
      .where(eq(usersTable.role, 'admin'))
    const adminCount = row?.total ?? 0

    const [target] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, targetUserId))
      .limit(1)
    if (!target) throw new Error('User not found')

    if (target.role === 'admin' && adminCount <= 1) {
      throw new Error('Cannot demote the last admin')
    }
  }

  await db
    .update(usersTable)
    .set({ role: newRole })
    .where(eq(usersTable.id, targetUserId))
}

/** Admin: get all users (for user management panel). */
export async function adminGetUsers() {
  await requireAdmin()
  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      status: usersTable.status,
      avatarUrl: usersTable.avatarUrl,
      lastLoginAt: usersTable.lastLoginAt,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt)
    .limit(100)
}

/** Admin: inject a demo deposit (inbound transaction) for a user. */
export async function adminInjectDeposit(
  userId: string,
  params: { amount: string; rail: string; description: string; reference: string },
): Promise<void> {
  await requireAdmin()
  const numeric = parseFloat(params.amount)
  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  await repo.insertTransaction({
    userId,
    description: params.description,
    category: `Deposit · ${params.rail}`,
    amount: `+$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    direction: 'inbound',
    transactionDate: dateLabel,
    accountRef: params.reference || 'Operating · Primary',
    status: 'Pending',
    statusTone: 'amber',
    sortOrder: -1,
  })
  await repo.adjustBalanceForTransaction(userId, numeric, 'inbound')
}

/** Admin: inject a demo withdrawal (outbound transaction) for a user. */
export async function adminInjectWithdrawal(
  userId: string,
  params: { amount: string; rail: string; recipient: string; memo: string },
): Promise<void> {
  await requireAdmin()
  const numeric = parseFloat(params.amount)
  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  await repo.insertTransaction({
    userId,
    description: params.recipient || `Withdrawal · ${params.rail}`,
    category: `Withdrawal · ${params.rail}`,
    amount: `−$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    direction: 'outbound',
    transactionDate: dateLabel,
    accountRef: params.memo || 'Operating · Primary',
    status: 'Pending',
    statusTone: 'amber',
    sortOrder: -1,
  })
  await repo.adjustBalanceForTransaction(userId, numeric, 'outbound')
}

/** Admin: create an account for a user. */
export async function adminCreateAccount(
  userId: string,
  params: {
    name: string
    lastFour: string
    bankName: string
    currency: string
    accountType: string
    routing?: string
    apy?: string
    status?: 'active' | 'earning' | 'pending'
  },
): Promise<void> {
  await requireAdmin()
  await repo.insertAccount({
    userId,
    name: params.name,
    lastFour: params.lastFour,
    bankName: params.bankName,
    currency: params.currency,
    accountType: params.accountType,
    routing: params.routing ?? null,
    apy: params.apy ?? '0',
    status: params.status ?? 'active',
    balance: '0.00',
    sortOrder: 999,
  })
}

/** Admin: adjust an account balance (add or subtract amount). */
export async function adminAdjustAccountBalance(
  accountId: string,
  amount: number,
  direction: 'add' | 'subtract',
): Promise<void> {
  await requireAdmin()
  await repo.adjustAccountBalance(accountId, amount, direction)
}

/** Admin: update account metadata fields. */
export async function adminUpdateAccount(
  accountId: string,
  params: {
    name?: string
    bankName?: string
    routing?: string
    apy?: string
    status?: 'active' | 'earning' | 'pending'
  },
): Promise<void> {
  await requireAdmin()
  await repo.updateAccount(accountId, params)
}

/** Admin: delete an account. */
export async function adminDeleteAccount(accountId: string): Promise<void> {
  await requireAdmin()
  await repo.deleteAccount(accountId)
}

/** User: cancel their own pending deposit (removes it from the DB). */
export async function userCancelDeposit(txnId: string): Promise<void> {
  const userId = await requireUserId()
  await repo.deleteTransaction(txnId, userId)
}

/** User: edit description/amount on a pending deposit they own. */
export async function userEditDeposit(
  txnId: string,
  params: { description: string; amountUsd: number; memo: string },
): Promise<void> {
  const userId = await requireUserId()
  const formatted = `+$${params.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  await repo.updateTransactionFields(txnId, {
    description: params.description || `Deposit via ACH`,
    amount: formatted,
    category: 'Deposit · ACH',
    accountRef: params.memo || 'Operating · Primary',
  })
}

/** Admin: approve a transaction (set status → Approved). */
export async function adminApproveTransaction(txnId: string): Promise<void> {
  await requireAdmin()
  await repo.updateTransactionStatus(txnId, 'Approved', 'green')
}

/** Admin: reject a transaction (set status → Rejected). */
export async function adminRejectTransaction(txnId: string): Promise<void> {
  await requireAdmin()
  await repo.updateTransactionStatus(txnId, 'Rejected', 'rose')
}

/** Admin: hold a transaction (set status → On Hold). */
export async function adminHoldTransaction(txnId: string): Promise<void> {
  await requireAdmin()
  await repo.updateTransactionStatus(txnId, 'On Hold', 'amber')
}

/** Admin: create a card for a user. */
export async function adminCreateCard(
  userId: string,
  params: {
    label: string
    cardUser: string
    lastFour: string
    network: string
    cardVariant: string
    number: string
    validThru: string
    limitAmount: string
    spentAmount?: string
    activationFee?: string
    isActivated?: boolean
    cardType: 'virtual' | 'physical'
    status?: 'active' | 'frozen' | 'limit_hit'
    isOwnerCard?: boolean
    sortOrder?: number
  },
): Promise<void> {
  await requireAdmin()
  await repo.insertCard({
    userId,
    label: params.label,
    cardUser: params.cardUser,
    lastFour: params.lastFour,
    network: params.network,
    cardVariant: params.cardVariant,
    number: params.number,
    validThru: params.validThru,
    limitAmount: params.limitAmount,
    spentAmount: params.spentAmount ?? '0',
    activationFee: params.activationFee ?? '0',
    isActivated: params.isActivated ?? true,
    cardType: params.cardType,
    status: params.status ?? 'active',
    isOwnerCard: params.isOwnerCard ?? false,
    sortOrder: params.sortOrder ?? 999,
  })
}

/** Admin: update any card fields. */
export async function adminUpdateCard(
  cardId: string,
  params: {
    label?: string
    cardUser?: string
    lastFour?: string
    network?: string
    cardVariant?: string
    number?: string
    validThru?: string
    limitAmount?: string
    spentAmount?: string
    activationFee?: string
    isActivated?: boolean
    cardType?: 'virtual' | 'physical'
    status?: 'active' | 'frozen' | 'limit_hit'
    isOwnerCard?: boolean
    sortOrder?: number
  },
): Promise<void> {
  await requireAdmin()
  await repo.updateCard(cardId, params)
}

/** Admin: delete a card. */
export async function adminDeleteCard(cardId: string): Promise<void> {
  await requireAdmin()
  await repo.deleteCard(cardId)
}

/** Admin: get all financial data for a specific user (for inspect/edit). */
export async function adminGetUserFinancialData(userId: string) {
  await requireAdmin()
  const [balance, accounts, transactions, cards, cardTxns, overviewSpend, cardsSpend, upcoming, activity, kpis, notifPrefs, cardStats] = await Promise.all([
    repo.getBalanceOverview(userId),
    repo.getAccounts(userId),
    repo.getTransactions(userId),
    repo.getCards(userId),
    repo.getCardTransactions(userId),
    repo.getSpendCategories(userId, 'overview'),
    repo.getSpendCategories(userId, 'cards'),
    repo.getUpcomingPayments(userId),
    repo.getActivityLogs(userId),
    repo.getKpiEntries(userId),
    repo.getNotificationPrefs(userId),
    repo.getCardProgramStats(userId),
  ])

  const overviewCats = overviewSpend.filter((c) => c.context === 'overview')
  const cardsCats = cardsSpend.filter((c) => c.context === 'cards')

  return {
    balance,
    accounts,
    transactions,
    cards,
    cardTxns,
    overviewSpend: overviewCats,
    cardsSpend: cardsCats,
    upcoming,
    activity,
    kpis,
    notifPrefs,
    cardStats,
    hasData: !!balance,
  }
}
