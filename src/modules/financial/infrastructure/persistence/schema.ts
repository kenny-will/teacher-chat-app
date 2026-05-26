import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  pgEnum,
  index,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'

// ─── Enums ───────────────────────────────────────────────────────────────────

export const cardStatusEnum = pgEnum('card_status_enum', ['active', 'frozen', 'limit_hit'])
export const cardTypeEnum = pgEnum('card_type_enum', ['virtual', 'physical'])
export const txnDirectionEnum = pgEnum('txn_direction_enum', ['inbound', 'outbound', 'auto'])
export const accountStatusEnum = pgEnum('account_status_enum', ['active', 'earning', 'pending'])
export const spendContextEnum = pgEnum('spend_context_enum', ['overview', 'cards'])
export const paymentToneEnum = pgEnum('payment_tone_enum', ['amber', 'brand', 'green', 'rose'])

// ─── Balance overview ────────────────────────────────────────────────────────

export const userBalanceOverviewsTable = pgTable(
  'user_balance_overviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    currentBalance: numeric('current_balance', { precision: 18, scale: 2 }).notNull().default('0'),
    inflowAmount: numeric('inflow_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    outflowAmount: numeric('outflow_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    netAmount: numeric('net_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    burnRatePerDay: numeric('burn_rate_per_day', { precision: 18, scale: 2 }).notNull().default('0'),
    balanceDelta: numeric('balance_delta', { precision: 8, scale: 2 }).notNull().default('0'),
    balanceChangeAmount: numeric('balance_change_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    inflowDelta: numeric('inflow_delta', { precision: 8, scale: 2 }).notNull().default('0'),
    outflowDelta: numeric('outflow_delta', { precision: 8, scale: 2 }).notNull().default('0'),
    netDelta: numeric('net_delta', { precision: 8, scale: 2 }).notNull().default('0'),
    burnRateDelta: numeric('burn_rate_delta', { precision: 8, scale: 2 }).notNull().default('0'),
    yieldApy: numeric('yield_apy', { precision: 8, scale: 4 }).notNull().default('0'),
    totalAccounts: integer('total_accounts').notNull().default(0),
    lastRebalancedAt: timestamp('last_rebalanced_at', { withTimezone: true }),
    // Stored as { "1W": [n,...], "1M": [...], "3M": [...], "1Y": [...] }
    balanceChartData: jsonb('balance_chart_data').$type<Record<string, number[]>>(),
    // [{label, value (pct), color, amount (display string)}]
    allocationData: jsonb('allocation_data').$type<
      Array<{ label: string; value: number; color: string; amount: string }>
    >(),
    // { weeks: {inflow, outflow, labels}, months: {inflow, outflow, labels} }
    cashFlowData: jsonb('cash_flow_data').$type<{
      weeks: { inflow: number[]; outflow: number[]; labels: string[] }
      months: { inflow: number[]; outflow: number[]; labels: string[] }
    }>(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('balance_overview_user_idx').on(table.userId)],
)

// ─── Bank accounts ────────────────────────────────────────────────────────────

export const userAccountsTable = pgTable(
  'user_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    lastFour: varchar('last_four', { length: 10 }).notNull(),
    bankName: varchar('bank_name', { length: 255 }).notNull(),
    // Stored as numeric string without symbol, e.g. "398420.11"
    balance: varchar('balance', { length: 50 }).notNull().default('0.00'),
    currency: varchar('currency', { length: 10 }).notNull().default('USD'),
    status: accountStatusEnum('status').notNull().default('active'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    // Extended fields
    apy: numeric('apy', { precision: 8, scale: 4 }).default('0'),
    routing: varchar('routing', { length: 100 }),
    accountType: varchar('account_type', { length: 20 }).notNull().default('bank'),
  },
  (table) => [index('user_accounts_user_idx').on(table.userId)],
)

// ─── Financial transactions ───────────────────────────────────────────────────

export const userTransactionsTable = pgTable(
  'user_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    description: varchar('description', { length: 255 }).notNull(),
    category: varchar('category', { length: 255 }).notNull(),
    amount: varchar('amount', { length: 50 }).notNull(),
    direction: txnDirectionEnum('direction').notNull().default('outbound'),
    transactionDate: varchar('transaction_date', { length: 50 }).notNull(),
    accountRef: varchar('account_ref', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull().default('Sent'),
    statusTone: varchar('status_tone', { length: 20 }).notNull().default('rose'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('user_transactions_user_idx').on(table.userId)],
)

// ─── Cards ────────────────────────────────────────────────────────────────────

export const userCardsTable = pgTable(
  'user_cards',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 255 }).notNull(),
    cardUser: varchar('card_user', { length: 255 }).notNull(),
    lastFour: varchar('last_four', { length: 10 }).notNull(),
    limitAmount: numeric('limit_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    spentAmount: numeric('spent_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    cardType: cardTypeEnum('card_type').notNull().default('virtual'),
    status: cardStatusEnum('status').notNull().default('active'),
    isOwnerCard: boolean('is_owner_card').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('user_cards_user_idx').on(table.userId)],
)

// ─── Card transactions ────────────────────────────────────────────────────────

export const userCardTransactionsTable = pgTable(
  'user_card_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    cardId: uuid('card_id').references(() => userCardsTable.id, { onDelete: 'set null' }),
    merchant: varchar('merchant', { length: 255 }).notNull(),
    cardLabel: varchar('card_label', { length: 255 }).notNull(),
    amount: varchar('amount', { length: 50 }).notNull(),
    transactionDate: varchar('transaction_date', { length: 50 }).notNull(),
    spentBy: varchar('spent_by', { length: 255 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('user_card_txns_user_idx').on(table.userId),
    index('user_card_txns_card_idx').on(table.cardId),
  ],
)

// ─── Spend categories ─────────────────────────────────────────────────────────

export const userSpendCategoriesTable = pgTable(
  'user_spend_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    // 'overview' = top spend bars, 'cards' = donut chart
    context: spendContextEnum('context').notNull().default('overview'),
    label: varchar('label', { length: 255 }).notNull(),
    amountDisplay: varchar('amount_display', { length: 50 }).notNull(),
    percentage: integer('percentage').notNull().default(0),
    color: varchar('color', { length: 20 }).notNull().default('#DDE1E7'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('user_spend_cats_user_idx').on(table.userId),
    index('user_spend_cats_context_idx').on(table.context),
  ],
)

// ─── Upcoming payments ────────────────────────────────────────────────────────

export const userUpcomingPaymentsTable = pgTable(
  'user_upcoming_payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    payee: varchar('payee', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }).notNull(),
    statusLabel: varchar('status_label', { length: 50 }).notNull().default('Scheduled'),
    dueDateDisplay: varchar('due_date_display', { length: 50 }).notNull(),
    tone: paymentToneEnum('tone').notNull().default('green'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('user_upcoming_pmts_user_idx').on(table.userId)],
)

// ─── Activity logs ────────────────────────────────────────────────────────────

export const userActivityLogsTable = pgTable(
  'user_activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    actorName: varchar('actor_name', { length: 255 }).notNull(),
    action: varchar('action', { length: 500 }).notNull(),
    timeAgo: varchar('time_ago', { length: 50 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('user_activity_logs_user_idx').on(table.userId)],
)

// ─── KPI entries ──────────────────────────────────────────────────────────────

export const userKpiEntriesTable = pgTable(
  'user_kpi_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 255 }).notNull(),
    value: varchar('value', { length: 100 }).notNull(),
    delta: numeric('delta', { precision: 8, scale: 2 }).notNull().default('0'),
    hint: varchar('hint', { length: 255 }),
    sparkData: jsonb('spark_data').$type<number[]>(),
    color: varchar('color', { length: 20 }).notNull().default('#2A5CFF'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('user_kpi_entries_user_idx').on(table.userId)],
)

// ─── Notification preferences ─────────────────────────────────────────────────

export const userNotificationPrefsTable = pgTable(
  'user_notification_prefs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 100 }).notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    enabled: boolean('enabled').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('user_notif_prefs_user_idx').on(table.userId)],
)

// ─── Card program stats ───────────────────────────────────────────────────────

export const userCardProgramStatsTable = pgTable(
  'user_card_program_stats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    cardSpendMtd: numeric('card_spend_mtd', { precision: 18, scale: 2 }).notNull().default('0'),
    cardSpendDelta: numeric('card_spend_delta', { precision: 8, scale: 2 }).notNull().default('0'),
    cardSpendSparkData: jsonb('card_spend_spark_data').$type<number[]>(),
    rebateEarnedYtd: numeric('rebate_earned_ytd', { precision: 18, scale: 2 }).notNull().default('0'),
    rebatePercent: numeric('rebate_percent', { precision: 5, scale: 2 }).notNull().default('1'),
    rebateClearedAmount: numeric('rebate_cleared_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    rebatePendingAmount: numeric('rebate_pending_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    topMerchantName: varchar('top_merchant_name', { length: 255 }),
    topMerchantAmount: varchar('top_merchant_amount', { length: 50 }),
    topMerchantCharges: integer('top_merchant_charges'),
    declinedThisMonth: integer('declined_this_month').notNull().default(0),
    declinedByPolicy: integer('declined_by_policy').notNull().default(0),
    declinedByNetwork: integer('declined_by_network').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('user_card_stats_user_idx').on(table.userId)],
)

// ─── Row types ────────────────────────────────────────────────────────────────

export type UserBalanceOverview = typeof userBalanceOverviewsTable.$inferSelect
export type NewUserBalanceOverview = typeof userBalanceOverviewsTable.$inferInsert
export type UserAccount = typeof userAccountsTable.$inferSelect
export type NewUserAccount = typeof userAccountsTable.$inferInsert
export type UserTransaction = typeof userTransactionsTable.$inferSelect
export type NewUserTransaction = typeof userTransactionsTable.$inferInsert
export type UserCard = typeof userCardsTable.$inferSelect
export type NewUserCard = typeof userCardsTable.$inferInsert
export type UserCardTransaction = typeof userCardTransactionsTable.$inferSelect
export type NewUserCardTransaction = typeof userCardTransactionsTable.$inferInsert
export type UserSpendCategory = typeof userSpendCategoriesTable.$inferSelect
export type NewUserSpendCategory = typeof userSpendCategoriesTable.$inferInsert
export type UserUpcomingPayment = typeof userUpcomingPaymentsTable.$inferSelect
export type NewUserUpcomingPayment = typeof userUpcomingPaymentsTable.$inferInsert
export type UserActivityLog = typeof userActivityLogsTable.$inferSelect
export type NewUserActivityLog = typeof userActivityLogsTable.$inferInsert
export type UserKpiEntry = typeof userKpiEntriesTable.$inferSelect
export type NewUserKpiEntry = typeof userKpiEntriesTable.$inferInsert
export type UserNotificationPref = typeof userNotificationPrefsTable.$inferSelect
export type NewUserNotificationPref = typeof userNotificationPrefsTable.$inferInsert
export type UserCardProgramStats = typeof userCardProgramStatsTable.$inferSelect
export type NewUserCardProgramStats = typeof userCardProgramStatsTable.$inferInsert
