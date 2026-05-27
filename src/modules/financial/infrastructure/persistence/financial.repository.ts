import { eq, asc, desc } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/client'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'
import {
  userBalanceOverviewsTable,
  userAccountsTable,
  userTransactionsTable,
  userCardsTable,
  userCardTransactionsTable,
  userSpendCategoriesTable,
  userUpcomingPaymentsTable,
  userActivityLogsTable,
  userKpiEntriesTable,
  userNotificationPrefsTable,
  userCardProgramStatsTable,
  type NewUserBalanceOverview,
  type NewUserAccount,
  type NewUserTransaction,
  type NewUserCard,
  type NewUserCardTransaction,
  type NewUserSpendCategory,
  type NewUserUpcomingPayment,
  type NewUserActivityLog,
  type NewUserKpiEntry,
  type NewUserNotificationPref,
  type NewUserCardProgramStats,
} from './schema'

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getBalanceOverview(userId: string) {
  const [row] = await db
    .select()
    .from(userBalanceOverviewsTable)
    .where(eq(userBalanceOverviewsTable.userId, userId))
    .limit(1)
  return row ?? null
}

export async function getAccounts(userId: string) {
  return db
    .select()
    .from(userAccountsTable)
    .where(eq(userAccountsTable.userId, userId))
    .orderBy(asc(userAccountsTable.sortOrder))
}

export async function getTransactions(userId: string) {
  return db
    .select()
    .from(userTransactionsTable)
    .where(eq(userTransactionsTable.userId, userId))
    .orderBy(asc(userTransactionsTable.sortOrder))
}

export async function getTransactionsByDirection(userId: string, direction: 'inbound' | 'outbound' | 'auto') {
  return db
    .select()
    .from(userTransactionsTable)
    .where(eq(userTransactionsTable.userId, userId))
    .orderBy(desc(userTransactionsTable.createdAt))
}

export async function getCards(userId: string) {
  return db
    .select()
    .from(userCardsTable)
    .where(eq(userCardsTable.userId, userId))
    .orderBy(asc(userCardsTable.sortOrder))
}

export async function getCardTransactions(userId: string) {
  return db
    .select()
    .from(userCardTransactionsTable)
    .where(eq(userCardTransactionsTable.userId, userId))
    .orderBy(asc(userCardTransactionsTable.sortOrder))
}

export async function getSpendCategories(userId: string, context: 'overview' | 'cards') {
  return db
    .select()
    .from(userSpendCategoriesTable)
    .where(eq(userSpendCategoriesTable.userId, userId))
    .orderBy(asc(userSpendCategoriesTable.sortOrder))
}

export async function getUpcomingPayments(userId: string) {
  return db
    .select()
    .from(userUpcomingPaymentsTable)
    .where(eq(userUpcomingPaymentsTable.userId, userId))
    .orderBy(asc(userUpcomingPaymentsTable.sortOrder))
}

export async function getActivityLogs(userId: string) {
  return db
    .select()
    .from(userActivityLogsTable)
    .where(eq(userActivityLogsTable.userId, userId))
    .orderBy(asc(userActivityLogsTable.sortOrder))
}

export async function getKpiEntries(userId: string) {
  return db
    .select()
    .from(userKpiEntriesTable)
    .where(eq(userKpiEntriesTable.userId, userId))
    .orderBy(asc(userKpiEntriesTable.sortOrder))
}

export async function getNotificationPrefs(userId: string) {
  return db
    .select()
    .from(userNotificationPrefsTable)
    .where(eq(userNotificationPrefsTable.userId, userId))
    .orderBy(asc(userNotificationPrefsTable.sortOrder))
}

export async function getCardProgramStats(userId: string) {
  const [row] = await db
    .select()
    .from(userCardProgramStatsTable)
    .where(eq(userCardProgramStatsTable.userId, userId))
    .limit(1)
  return row ?? null
}

export async function getAllTransactionsWithUsers() {
  return db
    .select({
      id: userTransactionsTable.id,
      userId: userTransactionsTable.userId,
      description: userTransactionsTable.description,
      category: userTransactionsTable.category,
      amount: userTransactionsTable.amount,
      direction: userTransactionsTable.direction,
      transactionDate: userTransactionsTable.transactionDate,
      accountRef: userTransactionsTable.accountRef,
      status: userTransactionsTable.status,
      statusTone: userTransactionsTable.statusTone,
      sortOrder: userTransactionsTable.sortOrder,
      createdAt: userTransactionsTable.createdAt,
      userName: usersTable.name,
      userEmail: usersTable.email,
      userAvatarUrl: usersTable.avatarUrl,
    })
    .from(userTransactionsTable)
    .innerJoin(usersTable, eq(userTransactionsTable.userId, usersTable.id))
    .orderBy(desc(userTransactionsTable.createdAt))
    .limit(2000)
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function upsertBalanceOverview(userId: string, data: Omit<NewUserBalanceOverview, 'id' | 'userId'>) {
  const existing = await getBalanceOverview(userId)
  if (existing) {
    const [row] = await db
      .update(userBalanceOverviewsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userBalanceOverviewsTable.userId, userId))
      .returning()
    return row
  }
  const [row] = await db
    .insert(userBalanceOverviewsTable)
    .values({ userId, ...data })
    .returning()
  return row
}

export async function upsertCardProgramStats(userId: string, data: Omit<NewUserCardProgramStats, 'id' | 'userId'>) {
  const existing = await getCardProgramStats(userId)
  if (existing) {
    const [row] = await db
      .update(userCardProgramStatsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userCardProgramStatsTable.userId, userId))
      .returning()
    return row
  }
  const [row] = await db
    .insert(userCardProgramStatsTable)
    .values({ userId, ...data })
    .returning()
  return row
}

export async function insertAccount(data: NewUserAccount) {
  const [row] = await db.insert(userAccountsTable).values(data).returning()
  return row
}

export async function updateAccount(id: string, data: Partial<Omit<NewUserAccount, 'id' | 'userId' | 'createdAt'>>) {
  const [row] = await db
    .update(userAccountsTable)
    .set(data)
    .where(eq(userAccountsTable.id, id))
    .returning()
  return row
}

export async function deleteAccount(id: string) {
  await db.delete(userAccountsTable).where(eq(userAccountsTable.id, id))
}

export async function adjustAccountBalance(id: string, amount: number, direction: 'add' | 'subtract') {
  const [account] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, id)).limit(1)
  if (!account) return
  const current = parseFloat(account.balance) || 0
  const newBalance = direction === 'add' ? current + amount : Math.max(0, current - amount)
  await db
    .update(userAccountsTable)
    .set({ balance: newBalance.toFixed(2) })
    .where(eq(userAccountsTable.id, id))
}

export async function insertTransaction(data: NewUserTransaction) {
  const [row] = await db.insert(userTransactionsTable).values(data).returning()
  return row
}

export async function deleteTransaction(id: string, userId: string) {
  await db
    .delete(userTransactionsTable)
    .where(eq(userTransactionsTable.id, id))
}

export async function updateTransactionFields(
  id: string,
  fields: Partial<Pick<NewUserTransaction, 'description' | 'amount' | 'category' | 'accountRef'>>,
) {
  const [row] = await db
    .update(userTransactionsTable)
    .set(fields)
    .where(eq(userTransactionsTable.id, id))
    .returning()
  return row
}

export async function insertCard(data: NewUserCard) {
  const [row] = await db.insert(userCardsTable).values(data).returning()
  return row
}

export async function updateCard(id: string, data: Partial<Omit<NewUserCard, 'id' | 'userId' | 'createdAt'>>) {
  const [row] = await db
    .update(userCardsTable)
    .set(data)
    .where(eq(userCardsTable.id, id))
    .returning()
  return row
}

export async function deleteCard(id: string) {
  await db.delete(userCardsTable).where(eq(userCardsTable.id, id))
}

export async function getCardById(id: string) {
  const [row] = await db
    .select()
    .from(userCardsTable)
    .where(eq(userCardsTable.id, id))
    .limit(1)
  return row ?? null
}

export async function insertCardTransaction(data: NewUserCardTransaction) {
  const [row] = await db.insert(userCardTransactionsTable).values(data).returning()
  return row
}

export async function insertSpendCategory(data: NewUserSpendCategory) {
  const [row] = await db.insert(userSpendCategoriesTable).values(data).returning()
  return row
}

export async function insertUpcomingPayment(data: NewUserUpcomingPayment) {
  const [row] = await db.insert(userUpcomingPaymentsTable).values(data).returning()
  return row
}

export async function insertActivityLog(data: NewUserActivityLog) {
  const [row] = await db.insert(userActivityLogsTable).values(data).returning()
  return row
}

export async function insertKpiEntry(data: NewUserKpiEntry) {
  const [row] = await db.insert(userKpiEntriesTable).values(data).returning()
  return row
}

export async function upsertNotificationPref(userId: string, key: string, label: string, enabled: boolean, sortOrder: number) {
  const [existing] = await db
    .select()
    .from(userNotificationPrefsTable)
    .where(eq(userNotificationPrefsTable.userId, userId))
    .limit(1)

  if (existing) {
    // Update all prefs is handled by the mutation; for single update use key match
    await db
      .update(userNotificationPrefsTable)
      .set({ enabled })
      .where(eq(userNotificationPrefsTable.userId, userId))
    return
  }
  await db.insert(userNotificationPrefsTable).values({ userId, key, label, enabled, sortOrder })
}

export async function updateTransactionStatus(id: string, status: string, statusTone: string) {
  await db
    .update(userTransactionsTable)
    .set({ status, statusTone })
    .where(eq(userTransactionsTable.id, id))
}

export async function updateNotificationPref(id: string, enabled: boolean) {
  await db
    .update(userNotificationPrefsTable)
    .set({ enabled })
    .where(eq(userNotificationPrefsTable.id, id))
}

export async function adjustBalanceForTransaction(userId: string, amount: number, direction: 'inbound' | 'outbound') {
  const balance = await getBalanceOverview(userId)

  if (!balance) {
    const newBalance  = direction === 'inbound' ? amount : 0
    const newInflow   = direction === 'inbound' ? amount : 0
    const newOutflow  = direction === 'outbound' ? amount : 0
    await db.insert(userBalanceOverviewsTable).values({
      userId,
      currentBalance:     newBalance.toFixed(2),
      inflowAmount:       newInflow.toFixed(2),
      outflowAmount:      newOutflow.toFixed(2),
      netAmount:          (newInflow - newOutflow).toFixed(2),
      burnRatePerDay:     '0',
      balanceDelta:       '0',
      balanceChangeAmount: amount.toFixed(2),
      inflowDelta:        '0',
      outflowDelta:       '0',
      netDelta:           '0',
      burnRateDelta:      '0',
      yieldApy:           '0',
      totalAccounts:      0,
    })
    return
  }

  const current = parseFloat(balance.currentBalance) || 0
  const inflow  = parseFloat(balance.inflowAmount)   || 0
  const outflow = parseFloat(balance.outflowAmount)  || 0

  const newBalance = direction === 'inbound' ? current + amount : Math.max(0, current - amount)
  const newInflow  = direction === 'inbound' ? inflow + amount  : inflow
  const newOutflow = direction === 'outbound' ? outflow + amount : outflow

  await db
    .update(userBalanceOverviewsTable)
    .set({
      currentBalance:     newBalance.toFixed(2),
      inflowAmount:       newInflow.toFixed(2),
      outflowAmount:      newOutflow.toFixed(2),
      netAmount:          (newInflow - newOutflow).toFixed(2),
      updatedAt:          new Date(),
    })
    .where(eq(userBalanceOverviewsTable.userId, userId))
}

export async function insertNotificationPref(data: NewUserNotificationPref) {
  const [row] = await db.insert(userNotificationPrefsTable).values(data).returning()
  return row
}

// ─── Clear all user financial data ───────────────────────────────────────────

export async function clearUserFinancialData(userId: string) {
  await Promise.all([
    db.delete(userActivityLogsTable).where(eq(userActivityLogsTable.userId, userId)),
    db.delete(userUpcomingPaymentsTable).where(eq(userUpcomingPaymentsTable.userId, userId)),
    db.delete(userSpendCategoriesTable).where(eq(userSpendCategoriesTable.userId, userId)),
    db.delete(userCardTransactionsTable).where(eq(userCardTransactionsTable.userId, userId)),
    db.delete(userCardsTable).where(eq(userCardsTable.userId, userId)),
    db.delete(userTransactionsTable).where(eq(userTransactionsTable.userId, userId)),
    db.delete(userAccountsTable).where(eq(userAccountsTable.userId, userId)),
    db.delete(userKpiEntriesTable).where(eq(userKpiEntriesTable.userId, userId)),
    db.delete(userNotificationPrefsTable).where(eq(userNotificationPrefsTable.userId, userId)),
    db.delete(userBalanceOverviewsTable).where(eq(userBalanceOverviewsTable.userId, userId)),
    db.delete(userCardProgramStatsTable).where(eq(userCardProgramStatsTable.userId, userId)),
  ])
}

// ─── Seed demo data for a user ────────────────────────────────────────────────

export async function seedDemoFinancialData(userId: string, ownerName: string) {
  await clearUserFinancialData(userId)

  // Balance overview
  await upsertBalanceOverview(userId, {
    currentBalance: '1284902.17',
    inflowAmount: '284402.00',
    outflowAmount: '254219.00',
    netAmount: '30182.50',
    burnRatePerDay: '8470.00',
    balanceDelta: '2.41',
    balanceChangeAmount: '30182.50',
    inflowDelta: '12.30',
    outflowDelta: '-4.10',
    netDelta: '21.40',
    burnRateDelta: '-3.20',
    yieldApy: '5.2100',
    totalAccounts: 12,
    lastRebalancedAt: new Date('2024-06-28T14:02:00Z'),
    balanceChartData: {
      '1W': [1240, 1238, 1242, 1248, 1251, 1265, 1284],
      '1M': [1180, 1188, 1200, 1190, 1215, 1232, 1244, 1268, 1255, 1290, 1284],
      '3M': [1050, 1080, 1098, 1110, 1124, 1148, 1176, 1204, 1230, 1268, 1284],
      '1Y': [820, 860, 902, 940, 980, 1020, 1064, 1112, 1156, 1198, 1244, 1284],
    },
    allocationData: [
      { label: 'Operating cash', value: 31, color: '#0A0C12', amount: '$398,420' },
      { label: 'Treasury sweep', value: 42, color: '#2A5CFF', amount: '$542,180' },
      { label: 'Equities', value: 14, color: '#85A8FF', amount: '$179,128' },
      { label: 'Credit & MMF', value: 9, color: '#B7CCFF', amount: '$115,640' },
      { label: 'FX reserves', value: 4, color: '#DDE1E7', amount: '$ 49,534' },
    ],
    cashFlowData: {
      weeks: {
        inflow: [42, 38, 55, 48, 62, 58, 71, 64, 80, 72, 84, 78],
        outflow: [18, 21, 17, 20, 16, 22, 15, 19, 14, 18, 12, 16],
        labels: ['W22', 'W23', 'W24', 'W25', 'W26', 'W27', 'W28', 'W29', 'W30', 'W31', 'W32', 'W33'],
      },
      months: {
        inflow: [220, 240, 260, 280, 310, 290, 320, 340, 360, 380, 400, 420],
        outflow: [180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290],
        labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      },
    },
  })

  // Bank accounts (balance stored as plain numeric string)
  const accounts = [
    { name: 'Operating · USD', lastFour: '4910', bankName: 'JPMorgan Chase', balance: '398420.11', currency: 'USD', status: 'active' as const, apy: '0', routing: '021000021', accountType: 'bank', sortOrder: 0 },
    { name: 'Treasury Sweep', lastFour: '7823', bankName: 'Meridian + BNY', balance: '542180.00', currency: 'USD', status: 'earning' as const, apy: '5.2100', routing: 'meridian-internal', accountType: 'sweep', sortOrder: 1 },
    { name: 'Payroll · USD', lastFour: '1042', bankName: 'Mercury · partner', balance: '118402.91', currency: 'USD', status: 'active' as const, apy: '0', routing: '084009519', accountType: 'bank', sortOrder: 2 },
    { name: 'EUR Operating', lastFour: '0091', bankName: 'BNP Paribas', balance: '84219.40', currency: 'EUR', status: 'active' as const, apy: '0', routing: 'IBAN FR76', accountType: 'bank', sortOrder: 3 },
    { name: 'GBP Trade', lastFour: '7711', bankName: 'HSBC', balance: '41180.00', currency: 'GBP', status: 'pending' as const, apy: '0', routing: '40-05-30', accountType: 'bank', sortOrder: 4 },
    { name: 'Bitcoin Wallet', lastFour: 'a1f9', bankName: 'Bitcoin Network', balance: '1.24500000', currency: 'BTC', status: 'active' as const, apy: '0', routing: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', accountType: 'crypto', sortOrder: 5 },
    { name: 'Ethereum Wallet', lastFour: '3c2e', bankName: 'Ethereum Network', balance: '12.50000000', currency: 'ETH', status: 'active' as const, apy: '0', routing: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', accountType: 'crypto', sortOrder: 6 },
  ]
  for (const a of accounts) {
    await insertAccount({ userId, ...a })
  }

  // Transactions
  const transactions = [
    { description: 'Stripe · payout', category: 'Inbound transfer', amount: '+$28,400.00', direction: 'inbound' as const, transactionDate: 'Today 09:14', accountRef: 'Operating · 4910', status: 'Paid', statusTone: 'green', sortOrder: 0 },
    { description: 'AWS · us-east-1', category: 'Cloud infrastructure', amount: '−$4,218.55', direction: 'outbound' as const, transactionDate: 'Today 06:02', accountRef: 'Card · Engineering', status: 'Sent', statusTone: 'rose', sortOrder: 1 },
    { description: 'Treasury bill — 13w', category: 'Auto-invest sweep', amount: '−$50,000.00', direction: 'auto' as const, transactionDate: 'Today 04:00', accountRef: 'Treasury · 7823', status: 'Auto', statusTone: 'brand', sortOrder: 2 },
    { description: 'Linear Software Inc.', category: 'SaaS subscription', amount: '−$1,250.00', direction: 'outbound' as const, transactionDate: 'Jun 28 22:11', accountRef: 'Card · Engineering', status: 'Sent', statusTone: 'rose', sortOrder: 3 },
    { description: 'ACH from Acme Corp.', category: 'Invoice INV-1042', amount: '+$84,200.00', direction: 'inbound' as const, transactionDate: 'Jun 28 14:32', accountRef: 'Operating · 4910', status: 'Paid', statusTone: 'green', sortOrder: 4 },
    { description: 'Wire to Atlas Components', category: 'Vendor payment', amount: '−$245,000.00', direction: 'outbound' as const, transactionDate: 'Jun 28 11:08', accountRef: 'Operating · 4910', status: 'Pending 2/3', statusTone: 'amber', sortOrder: 5 },
    { description: 'Reimbursement · M. Lee', category: 'Travel · NYC', amount: '−$1,840.92', direction: 'outbound' as const, transactionDate: 'Jun 27 18:40', accountRef: 'Payroll · 1042', status: 'Sent', statusTone: 'rose', sortOrder: 6 },
  ]
  for (const t of transactions) {
    await insertTransaction({ userId, ...t })
  }

  // Cards
  const cards = [
    { label: 'Platinum', cardUser: ownerName, lastFour: '0192', network: 'Mastercard', cardVariant: 'debit', number: '5412 7512 3412 0192', validThru: '12/27', limitAmount: '50000', spentAmount: '24180', activationFee: '0', isActivated: true, cardType: 'physical' as const, status: 'active' as const, isOwnerCard: true, sortOrder: 0 },
    { label: 'Engineering · Virtual', cardUser: 'AWS, GCP, Datadog', lastFour: '7714', network: 'Visa', cardVariant: 'credit', number: '4111 0000 1234 7714', validThru: '09/28', limitAmount: '80000', spentAmount: '62420', activationFee: '0', isActivated: true, cardType: 'virtual' as const, status: 'active' as const, isOwnerCard: false, sortOrder: 1 },
    { label: 'Travel', cardUser: 'Marcus Lee', lastFour: '1188', network: 'Visa Infinite', cardVariant: 'infinite', number: '4000 0000 0011 1188', validThru: '06/29', limitAmount: '15000', spentAmount: '8420', activationFee: '5', isActivated: true, cardType: 'physical' as const, status: 'active' as const, isOwnerCard: false, sortOrder: 2 },
    { label: 'Growth · Ads', cardUser: 'Google, Meta, LinkedIn', lastFour: '9203', network: 'Mastercard Gold', cardVariant: 'credit', number: '5500 9876 5432 9203', validThru: '03/29', limitAmount: '100000', spentAmount: '98500', activationFee: '0', isActivated: true, cardType: 'virtual' as const, status: 'limit_hit' as const, isOwnerCard: false, sortOrder: 3 },
    { label: 'Operations', cardUser: 'Office, supplies', lastFour: '4012', network: 'Verve', cardVariant: 'debit', number: '6500 1234 5678 4012', validThru: '11/30', limitAmount: '10000', spentAmount: '3120', activationFee: '2.50', isActivated: true, cardType: 'virtual' as const, status: 'active' as const, isOwnerCard: false, sortOrder: 4 },
    { label: 'Onboarding · Frozen', cardUser: 'Priya Shah (offboarded)', lastFour: '6677', network: 'Mastercard', cardVariant: 'debit', number: '5412 0000 0066 6677', validThru: '01/26', limitAmount: '5000', spentAmount: '0', activationFee: '5', isActivated: false, cardType: 'physical' as const, status: 'frozen' as const, isOwnerCard: false, sortOrder: 5 },
  ]
  const insertedCards: Array<{ id: string; label: string }> = []
  for (const c of cards) {
    const row = await insertCard({ userId, ...c })
    insertedCards.push({ id: row.id, label: row.label })
  }

  const engineeringCardId = insertedCards.find((c) => c.label === 'Engineering · Virtual')?.id

  // Card transactions
  const cardTxns = [
    { merchant: 'AWS · us-east-1', cardLabel: 'Engineering · Virtual', amount: '−$4,218.55', transactionDate: 'Today 06:02', spentBy: ownerName, sortOrder: 0 },
    { merchant: 'Linear Software Inc.', cardLabel: 'Engineering · Virtual', amount: '−$1,250.00', transactionDate: 'Jun 28 22:11', spentBy: ownerName, sortOrder: 1 },
    { merchant: 'Google Ads', cardLabel: 'Growth · Ads', amount: '−$8,420.00', transactionDate: 'Jun 28 14:00', spentBy: 'Owen Park', sortOrder: 2 },
    { merchant: 'Marriott NYC', cardLabel: 'Travel', amount: '−$1,840.92', transactionDate: 'Jun 27 18:40', spentBy: 'Marcus Lee', sortOrder: 3 },
    { merchant: 'Datadog Inc.', cardLabel: 'Engineering · Virtual', amount: '−$3,420.00', transactionDate: 'Jun 26 09:00', spentBy: ownerName, sortOrder: 4 },
    { merchant: 'Notion Labs', cardLabel: 'Operations', amount: '−$1,840.00', transactionDate: 'Jun 26 09:00', spentBy: 'Owen Park', sortOrder: 5 },
  ]
  for (const ct of cardTxns) {
    await insertCardTransaction({
      userId,
      cardId: ct.cardLabel === 'Engineering · Virtual' ? engineeringCardId ?? null : null,
      ...ct,
    })
  }

  // Spend categories — overview context (top spend bars)
  const overviewSpend = [
    { label: 'Cloud · AWS, GCP', amountDisplay: '$48,420', percentage: 62, color: '#2A5CFF', sortOrder: 0 },
    { label: 'Salaries · 84 staff', amountDisplay: '$412,800', percentage: 98, color: '#0A0C12', sortOrder: 1 },
    { label: 'Software · SaaS', amountDisplay: '$24,180', percentage: 38, color: '#85A8FF', sortOrder: 2 },
    { label: 'Vendors · contract', amountDisplay: '$98,120', percentage: 54, color: '#B7CCFF', sortOrder: 3 },
    { label: 'Travel & meals', amountDisplay: '$8,420', percentage: 18, color: '#DDE1E7', sortOrder: 4 },
  ]
  for (const s of overviewSpend) {
    await insertSpendCategory({ userId, context: 'overview', ...s })
  }

  // Spend categories — cards context (donut chart)
  const cardsSpend = [
    { label: 'Cloud / SaaS', amountDisplay: '$74,720', percentage: 38, color: '#2A5CFF', sortOrder: 0 },
    { label: 'Marketing / Ads', amountDisplay: '$43,260', percentage: 22, color: '#0A0C12', sortOrder: 1 },
    { label: 'Travel & meals', amountDisplay: '$35,400', percentage: 18, color: '#85A8FF', sortOrder: 2 },
    { label: 'Office / Supplies', amountDisplay: '$23,600', percentage: 12, color: '#B7CCFF', sortOrder: 3 },
    { label: 'Other', amountDisplay: '$19,660', percentage: 10, color: '#DDE1E7', sortOrder: 4 },
  ]
  for (const s of cardsSpend) {
    await insertSpendCategory({ userId, context: 'cards', ...s })
  }

  // KPI entries
  const kpis = [
    { label: 'Cash runway', value: '18.3 months', delta: '1.40', hint: '@ current burn', sparkData: [18, 17, 17, 18, 18, 19, 18, 19, 18, 18, 19, 18], color: '#2A5CFF', sortOrder: 0 },
    { label: 'AR aging > 30d', value: '$184,210', delta: '-12.00', hint: '14 open invoices', sparkData: [26, 24, 22, 24, 22, 20, 18, 19, 18, 18, 17, 18], color: '#10B981', sortOrder: 1 },
    { label: 'AP due 7d', value: '$92,508', delta: '8.20', hint: '9 vendors', sparkData: [5, 7, 8, 10, 11, 9, 10, 12, 13, 12, 14, 13], color: '#F59E0B', sortOrder: 2 },
    { label: 'Treasury yield', value: '5.21% APY', delta: '0.08', hint: '$842k swept', sparkData: [4.8, 4.9, 5.0, 5.0, 5.1, 5.1, 5.1, 5.15, 5.18, 5.19, 5.2, 5.21], color: '#2A5CFF', sortOrder: 3 },
  ]
  for (const k of kpis) {
    await insertKpiEntry({ userId, ...k })
  }

  // Upcoming payments
  const upcoming = [
    { payee: 'Atlas Components', description: 'Wire · $245,000', statusLabel: 'Awaiting approval', dueDateDisplay: 'Tomorrow', tone: 'amber' as const, sortOrder: 0 },
    { payee: 'Stripe', description: 'Card processing fees · $18,420', statusLabel: 'Auto', dueDateDisplay: 'Jun 30', tone: 'brand' as const, sortOrder: 1 },
    { payee: 'Payroll · 84 ppl', description: 'Direct deposit · $412,800', statusLabel: 'Scheduled', dueDateDisplay: 'Jul 1', tone: 'green' as const, sortOrder: 2 },
    { payee: 'AWS', description: 'Invoice · $34,200', statusLabel: 'Scheduled', dueDateDisplay: 'Jul 3', tone: 'green' as const, sortOrder: 3 },
  ]
  for (const u of upcoming) {
    await insertUpcomingPayment({ userId, ...u })
  }

  // Activity logs
  const activity = [
    { actorName: 'Marcus Lee', action: 'approved wire · $245,000 → Atlas', timeAgo: '9m ago', sortOrder: 0 },
    { actorName: 'Owen Park', action: 'issued virtual card · Engineering', timeAgo: '42m ago', sortOrder: 1 },
    { actorName: 'Priya Shah', action: 'exported June statement', timeAgo: '1h ago', sortOrder: 2 },
    { actorName: 'Sara Patel', action: 'rebalanced treasury · +$120k', timeAgo: '2h ago', sortOrder: 3 },
    { actorName: 'System', action: '13w T-bill auto-rolled', timeAgo: '4h ago', sortOrder: 4 },
  ]
  for (const a of activity) {
    await insertActivityLog({ userId, ...a })
  }

  // Notification prefs
  const notifs = [
    { key: 'large_txn', label: 'Large transactions (≥$50k)', enabled: true, sortOrder: 0 },
    { key: 'new_invoice', label: 'New invoice received', enabled: true, sortOrder: 1 },
    { key: 'approval_req', label: 'Approval requested', enabled: true, sortOrder: 2 },
    { key: 'card_declined', label: 'Card declined', enabled: true, sortOrder: 3 },
    { key: 'weekly_cash', label: 'Weekly cash position', enabled: true, sortOrder: 4 },
    { key: 'treasury_rebal', label: 'Treasury rebalanced', enabled: false, sortOrder: 5 },
    { key: 'compliance', label: 'Compliance alerts', enabled: true, sortOrder: 6 },
    { key: 'product_updates', label: 'Product updates', enabled: false, sortOrder: 7 },
  ]
  for (const n of notifs) {
    await insertNotificationPref({ userId, ...n })
  }

  // Card program stats
  await upsertCardProgramStats(userId, {
    cardSpendMtd: '196640.00',
    cardSpendDelta: '8.40',
    cardSpendSparkData: [120, 140, 155, 168, 172, 184, 196, 196.64],
    rebateEarnedYtd: '11420.00',
    rebatePercent: '1.00',
    rebateClearedAmount: '6400.00',
    rebatePendingAmount: '5000.00',
    topMerchantName: 'AWS · us-east',
    topMerchantAmount: '$48,420',
    topMerchantCharges: 28,
    declinedThisMonth: 14,
    declinedByPolicy: 11,
    declinedByNetwork: 3,
  })
}
