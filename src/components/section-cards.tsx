"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import type { KpiSummaryDTO } from "@/modules/analytics/application/dtos/dashboard-metrics.dto"

interface SectionCardsProps {
  data?: KpiSummaryDTO
}

const FALLBACK: KpiSummaryDTO = {
  totalRevenue: 847234,
  revenueChange: 20.1,
  activeUsers: 12847,
  usersChange: 8.2,
  newSignups: 3241,
  signupsChange: 12.5,
  churnRate: 2.4,
  churnChange: -0.3,
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

export function SectionCards({ data = FALLBACK }: SectionCardsProps) {
  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      change: data.revenueChange,
      footer: "vs. previous month",
    },
    {
      label: "New Signups",
      value: formatNumber(data.newSignups),
      change: data.signupsChange,
      footer: "new users this month",
    },
    {
      label: "Active Users",
      value: formatNumber(data.activeUsers),
      change: data.usersChange,
      footer: "monthly active accounts",
    },
    {
      label: "Churn Rate",
      value: `${data.churnRate.toFixed(1)}%`,
      change: data.churnChange,
      footer: "user churn this month",
      invertTrend: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => {
        const isPositive = card.change > 0
        const isGood = card.invertTrend ? !isPositive : isPositive
        const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon
        const sign = isPositive ? "+" : ""

        return (
          <Card key={card.label} className="@container/card">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <Icon className={isGood ? "text-emerald-500" : "text-red-500"} />
                  {sign}{card.change.toFixed(1)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {isGood ? "Trending up" : "Trending down"} <Icon className="size-4" />
              </div>
              <div className="text-muted-foreground">{card.footer}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
