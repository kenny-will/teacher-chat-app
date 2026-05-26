"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, ExternalLinkIcon } from "lucide-react"
import { Delta, Tag, PageHeader, SectionHeader, Divider, ProgressBar } from "@/components/meridian/primitives"
import { Sparkline } from "@/components/meridian/charts"
import { cn } from "@/lib/utils"

const CATEGORIES = ["All", "Accounting", "Payroll", "HRIS", "CRM", "BI", "Productivity"]

const APPS = [
  { name: "QuickBooks Online", cat: "Accounting", status: "Connected · 4m sync", tone: "green", abbr: "QB" },
  { name: "Netsuite", cat: "Accounting", status: "Connected · 9m sync", tone: "green", abbr: "NS" },
  { name: "Xero", cat: "Accounting", status: "Not connected", tone: "neutral", abbr: "XR" },
  { name: "Gusto", cat: "Payroll", status: "Connected · 1h sync", tone: "green", abbr: "GS" },
  { name: "Rippling", cat: "Payroll", status: "Not connected", tone: "neutral", abbr: "RP" },
  { name: "Slack", cat: "Productivity", status: "Connected · live", tone: "green", abbr: "SL" },
  { name: "Notion", cat: "Productivity", status: "Connected · live", tone: "green", abbr: "NT" },
  { name: "Workday", cat: "HRIS", status: "Connected · daily", tone: "green", abbr: "WD" },
  { name: "HubSpot", cat: "CRM", status: "Connected · live", tone: "green", abbr: "HS" },
  { name: "Salesforce", cat: "CRM", status: "Reauth required", tone: "amber", abbr: "SF" },
  { name: "Looker", cat: "BI", status: "Connected · live", tone: "green", abbr: "LK" },
  { name: "Mode", cat: "BI", status: "Not connected", tone: "neutral", abbr: "MD" },
] as const

export function IntegrationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Connectivity"
        title="Integrations."
        subtitle="78 apps. One-click connect. Two-way sync. Webhooks for everything."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLinkIcon className="h-3.5 w-3.5" />API docs
            </Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />New connection
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* KPIs */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-[11.5px] text-gray-500">Connected apps</div>
          <div className="font-semibold text-[32px] leading-none tracking-tight mt-1">9 / 78</div>
          <ProgressBar value={11.5} className="mt-3" />
          <div className="mt-2 text-[11.5px] text-gray-500">+2 in last 30 days</div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-[11.5px] text-gray-500">Webhooks · 24h</div>
          <div className="font-semibold text-[32px] leading-none tracking-tight mt-1">128,420</div>
          <div className="mt-1 text-[12px] flex items-center gap-1.5">
            <Delta value={4.2} /><span className="text-gray-500">vs yesterday</span>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-[11.5px] text-gray-500">API calls · MTD</div>
          <div className="font-semibold text-[32px] leading-none tracking-tight mt-1">2.41M</div>
          <div className="mt-3 h-7">
            <Sparkline
              data={Array.from({ length: 20 }, (_, i) => 60 + i * 4 + Math.random() * 8)}
              height={28}
            />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-[11.5px] text-gray-500">Failures · 24h</div>
          <div className="font-semibold text-[32px] leading-none tracking-tight mt-1">14</div>
          <div className="mt-1 text-[12px] flex items-center gap-1.5">
            <Delta value={-22} /><span className="text-gray-500">retries auto</span>
          </div>
        </div>

        {/* Catalog */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SectionHeader title="Catalog" />
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((c, i) => (
                <button
                  key={c}
                  className={cn(
                    "h-7 px-3 rounded-full text-[12px] font-medium transition",
                    i === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {APPS.map((a, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-md bg-gray-100 grid place-items-center font-mono text-[12px] font-semibold">
                    {a.abbr}
                  </div>
                  <Tag tone={a.tone as "green" | "amber" | "neutral"}>
                    {a.tone === "green" ? "Connected" : a.tone === "amber" ? "Action needed" : "Available"}
                  </Tag>
                </div>
                <div className="mt-3 text-[13.5px] font-semibold">{a.name}</div>
                <div className="text-[11.5px] text-gray-500 mt-0.5">{a.cat}</div>
                <Divider className="my-3" />
                <div className="text-[11px] text-gray-500 mb-3">{a.status}</div>
                <Button
                  variant={a.tone === "green" ? "outline" : "default"}
                  size="sm"
                  className="w-full justify-center"
                >
                  {a.tone === "green" ? "Manage" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
