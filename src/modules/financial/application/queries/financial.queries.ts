'use server'

import { getServerSession } from '@/shared/infrastructure/auth/session'
import * as repo from '@/modules/financial/infrastructure/persistence/financial.repository'

async function requireUserId(): Promise<string> {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthenticated')
  return session.user.id
}

export async function queryBalanceOverview() {
  const userId = await requireUserId()
  return repo.getBalanceOverview(userId)
}

export async function queryAccounts() {
  const userId = await requireUserId()
  return repo.getAccounts(userId)
}

export async function queryTransactions() {
  const userId = await requireUserId()
  return repo.getTransactions(userId)
}

export async function queryCards() {
  const userId = await requireUserId()
  return repo.getCards(userId)
}

export async function queryCardTransactions() {
  const userId = await requireUserId()
  return repo.getCardTransactions(userId)
}

export async function queryOverviewSpendCategories() {
  const userId = await requireUserId()
  const all = await repo.getSpendCategories(userId, 'overview')
  return all.filter((c) => c.context === 'overview')
}

export async function queryCardsSpendCategories() {
  const userId = await requireUserId()
  const all = await repo.getSpendCategories(userId, 'cards')
  return all.filter((c) => c.context === 'cards')
}

export async function queryUpcomingPayments() {
  const userId = await requireUserId()
  return repo.getUpcomingPayments(userId)
}

export async function queryActivityLogs() {
  const userId = await requireUserId()
  return repo.getActivityLogs(userId)
}

export async function queryKpiEntries() {
  const userId = await requireUserId()
  return repo.getKpiEntries(userId)
}

export async function queryNotificationPrefs() {
  const userId = await requireUserId()
  return repo.getNotificationPrefs(userId)
}

export async function queryCardProgramStats() {
  const userId = await requireUserId()
  return repo.getCardProgramStats(userId)
}

export async function mutateNotificationPref(id: string, enabled: boolean) {
  // Allow user to update their own pref
  await requireUserId()
  await repo.updateNotificationPref(id, enabled)
}
