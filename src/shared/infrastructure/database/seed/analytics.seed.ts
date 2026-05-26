import { db } from '@/shared/infrastructure/database/client'
import { metricsTable, chartDataPointsTable } from '@/modules/analytics/infrastructure/persistence/schema'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'seed:analytics' })

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Base monthly revenue with 15% YoY growth trend and seasonal variation. */
function generateRevenueSeries(): number[] {
  const base = [58000, 52000, 61000, 67000, 72000, 78000, 71000, 75000, 82000, 88000, 95000, 107000]
  return base.map((v) => v + Math.floor(Math.random() * 2000 - 1000))
}

function generateExpensesSeries(revenues: number[]): number[] {
  return revenues.map((r) => Math.floor(r * (0.58 + Math.random() * 0.08)))
}

/**
 * Seeds the analytics tables with 12 months of realistic metric data.
 */
export async function seedAnalytics(): Promise<void> {
  log.info('Seeding analytics data…')

  const now = new Date()
  const year = now.getFullYear()
  const revenues = generateRevenueSeries()
  const expenses = generateExpensesSeries(revenues)

  const totalRevenue = revenues.reduce((a, b) => a + b, 0)
  const prevTotalRevenue = Math.floor(totalRevenue / 1.201)

  type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  type MetricType = 'revenue' | 'users' | 'sessions' | 'conversions' | 'churn'
  type MetricRow = { type: MetricType; period: MetricPeriod; value: string; previousValue: string; periodStart: Date; periodEnd: Date }

  // --- Monthly revenue metrics ---
  const metricRows: MetricRow[] = MONTHS.map((_, i) => {
    const periodStart = new Date(year, i, 1)
    const periodEnd = new Date(year, i + 1, 0, 23, 59, 59)
    const prevValue = Math.floor(revenues[i] / 1.15)
    return {
      type: 'revenue' as const,
      period: 'monthly' as const,
      value: revenues[i].toString(),
      previousValue: prevValue.toString(),
      periodStart,
      periodEnd,
    }
  })

  // Add aggregate annual metric
  metricRows.push({
    type: 'revenue' as const,
    period: 'yearly' as const,
    value: totalRevenue.toString(),
    previousValue: prevTotalRevenue.toString(),
    periodStart: new Date(year, 0, 1),
    periodEnd: new Date(year, 11, 31, 23, 59, 59),
  })

  // --- User & conversion metrics ---
  const kpiMetrics = [
    {
      type: 'users' as const,
      period: 'monthly' as const,
      value: '12847',
      previousValue: '11880',
      periodStart: new Date(year, now.getMonth(), 1),
      periodEnd: new Date(year, now.getMonth() + 1, 0),
    },
    {
      type: 'conversions' as const,
      period: 'monthly' as const,
      value: '3241',
      previousValue: '2880',
      periodStart: new Date(year, now.getMonth(), 1),
      periodEnd: new Date(year, now.getMonth() + 1, 0),
    },
    {
      type: 'churn' as const,
      period: 'monthly' as const,
      value: '2.4',
      previousValue: '2.7',
      periodStart: new Date(year, now.getMonth(), 1),
      periodEnd: new Date(year, now.getMonth() + 1, 0),
    },
    {
      type: 'sessions' as const,
      period: 'monthly' as const,
      value: '48291',
      previousValue: '43100',
      periodStart: new Date(year, now.getMonth(), 1),
      periodEnd: new Date(year, now.getMonth() + 1, 0),
    },
  ]

  await db.delete(metricsTable)
  await db.insert(metricsTable).values([...metricRows, ...kpiMetrics])

  // --- Chart data points (revenue + expenses area chart) ---
  const chartRows = MONTHS.map((label, i) => ({
    series: 'revenue',
    label,
    value: revenues[i].toString(),
    secondaryValue: expenses[i].toString(),
    sortOrder: i,
    periodStart: new Date(year, i, 1),
  }))

  await db.delete(chartDataPointsTable)
  await db.insert(chartDataPointsTable).values(chartRows)

  log.info({ metrics: metricRows.length + kpiMetrics.length, chartPoints: chartRows.length }, 'Analytics seeded')
}
