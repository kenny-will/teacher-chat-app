import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  pgEnum,
  index,
  integer,
} from 'drizzle-orm/pg-core'

export const metricTypeEnum = pgEnum('metric_type', [
  'revenue',
  'users',
  'sessions',
  'conversions',
  'churn',
])

export const metricPeriodEnum = pgEnum('metric_period', [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
])

export const metricsTable = pgTable(
  'metrics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: metricTypeEnum('type').notNull(),
    period: metricPeriodEnum('period').notNull(),
    value: numeric('value', { precision: 15, scale: 4 }).notNull(),
    previousValue: numeric('previous_value', { precision: 15, scale: 4 }),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('metrics_type_idx').on(table.type),
    index('metrics_period_start_idx').on(table.periodStart),
    index('metrics_type_period_idx').on(table.type, table.period),
  ],
)

export const chartDataPointsTable = pgTable(
  'chart_data_points',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    series: varchar('series', { length: 100 }).notNull(),
    label: varchar('label', { length: 100 }).notNull(),
    value: numeric('value', { precision: 15, scale: 4 }).notNull(),
    secondaryValue: numeric('secondary_value', { precision: 15, scale: 4 }),
    sortOrder: integer('sort_order').notNull().default(0),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('chart_series_idx').on(table.series),
    index('chart_period_idx').on(table.periodStart),
  ],
)

export type MetricRow = typeof metricsTable.$inferSelect
export type NewMetricRow = typeof metricsTable.$inferInsert
export type ChartDataPointRow = typeof chartDataPointsTable.$inferSelect
export type NewChartDataPointRow = typeof chartDataPointsTable.$inferInsert
