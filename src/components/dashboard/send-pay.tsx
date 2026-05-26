"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, SendIcon, PlusIcon, CalendarIcon, MoreHorizontalIcon, ChevronDownIcon } from "lucide-react"
import { Tag, PageHeader, SectionHeader, AvatarBadge, Divider } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

const RECENTS = [
  ["Atlas Components", "atlas@components.io", "Operating", 98420.0],
  ["Marcus Lee", "marcus@northwind.co", "Reimbursement", 1840.92],
  ["Acme Corp.", "accounts@acmecorp.com", "Refund", 24800.0],
  ["Lumen Labs", "ar@lumenlabs.eu", "Invoice", 48600.0],
  ["Stripe Inc.", "—", "Processor fees", 18420.0],
  ["Pinpoint LLC", "billing@pinpoint.co", "Vendor", 24800.0],
] as const

const SCHEDULED = [
  ["Atlas Components", "Wire · $245,000.00", "Awaiting approval · 2/3", "Jul 1, 09:00", "amber"],
  ["Payroll · 84 staff", "ACH · $412,800.00", "Scheduled", "Jul 1, 06:00", "green"],
  ["AWS", "ACH · $34,200.00", "Scheduled", "Jul 3, 09:00", "green"],
  ["Office lease", "ACH · $28,000.00", "Scheduled", "Jul 5, 09:00", "green"],
  ["Datadog", "Card auto-pay · $3,420.00", "Auto", "Jul 6, 00:00", "brand"],
  ["Notion Labs", "Card auto-pay · $1,840.00", "Auto", "Jul 7, 00:00", "brand"],
] as const

const APPROVALS = [
  ["Atlas Components", "$245,000", "2 / 3 approved", "Marcus, Owen"],
  ["Pinpoint LLC", "$24,800", "1 / 2 approved", "Marcus"],
] as const

const RAILS = ["ACH · $0.01", "Wire · 0.5bps", "RTP · instant"] as const

export function SendPayPage() {
  const [recipient, setRecipient] = useState(0)
  const [rail, setRail] = useState("Wire · 0.5bps")

  return (
    <>
      <PageHeader
        eyebrow="Pay"
        title="Send & pay."
        subtitle="ACH, wires, RTP, FedNow, SEPA, FPS and SWIFT — pick a recipient, choose a rail. Done in 9 seconds."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Batch CSV
            </Button>
            <Button size="sm" className="gap-1.5">
              <SendIcon className="h-3.5 w-3.5" />New payment
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Payment composer */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="New payment" subtitle="Step 2 of 3 · Review & schedule" />

          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Recipient */}
            <div className="col-span-2">
              <div className="text-[11.5px] text-gray-500 mb-1">Recipient</div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <AvatarBadge name={RECENTS[recipient][0]} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{RECENTS[recipient][0]}</div>
                  <div className="text-[11.5px] text-gray-500">{RECENTS[recipient][1]}</div>
                </div>
                <Tag tone="green">Verified</Tag>
              </div>
            </div>

            {/* From account */}
            <div>
              <div className="text-[11.5px] text-gray-500 mb-1">From</div>
              <div className="rounded-lg border border-gray-200 px-3 h-10 flex items-center text-[13px] justify-between">
                <span>Operating · USD •••• 4910</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="text-[11.5px] text-gray-500 mb-1">Amount</div>
              <div className="rounded-lg border border-gray-200 px-3 h-10 flex items-center text-[13px] justify-between font-mono">
                <span className="text-gray-400">USD</span>
                <span className="font-semibold tabular-nums">
                  {RECENTS[recipient][3].toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Rail selector */}
            <div className="col-span-2">
              <div className="text-[11.5px] text-gray-500 mb-1">Rail</div>
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 w-full">
                {RAILS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRail(r)}
                    className={cn(
                      "flex-1 h-8 rounded-md text-[12px] font-medium transition",
                      rail === r ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Settle date */}
            <div>
              <div className="text-[11.5px] text-gray-500 mb-1">Settle</div>
              <div className="rounded-lg border border-gray-200 px-3 h-10 flex items-center text-[13px] justify-between">
                <span>Today, 11:00 PT</span>
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Memo */}
            <div className="col-span-2">
              <div className="text-[11.5px] text-gray-500 mb-1">Memo</div>
              <div className="rounded-lg border border-gray-200 p-3 text-[12.5px] text-gray-500 italic">
                "Invoice INV-{RECENTS[recipient][0].slice(0, 3).toUpperCase()}-1042 · Q2 deliverables"
              </div>
            </div>
          </div>

          {/* Fee summary */}
          <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 p-4 grid grid-cols-3 gap-3 text-[12px]">
            <div>
              <div className="text-gray-500">Recipient gets</div>
              <div className="font-semibold tabular-nums text-[14px]">
                ${RECENTS[recipient][3].toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Fee</div>
              <div className="font-semibold tabular-nums text-[14px]">$12.50</div>
            </div>
            <div>
              <div className="text-gray-500">Estimated arrival</div>
              <div className="font-semibold text-[14px]">~ 11 seconds</div>
            </div>
          </div>

          <Divider className="my-4" />
          <div className="flex items-center justify-between">
            <div className="text-[12px] text-gray-500">
              Needs <span className="text-gray-900 font-medium">2 of 3</span> approvers · CFO required for amounts ≥ $200k
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Save draft</Button>
              <Button size="sm">Send for approval</Button>
            </div>
          </div>
        </div>

        {/* Recent recipients */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Recent recipients"
            right={<button className="text-[12px] text-blue-600 font-medium">Manage</button>}
          />
          <div className="mt-3 space-y-1">
            {RECENTS.map((r, i) => (
              <button
                key={i}
                onClick={() => setRecipient(i)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg p-2.5 transition text-left",
                  recipient === i ? "bg-gray-900 text-white" : "hover:bg-gray-50"
                )}
              >
                <AvatarBadge name={r[0]} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{r[0]}</div>
                  <div className={cn("text-[11px] truncate", recipient === i ? "text-white/60" : "text-gray-500")}>
                    {r[2]}
                  </div>
                </div>
                <div className={cn("text-[12px] tabular-nums font-medium shrink-0", recipient === i ? "text-white/80" : "text-gray-700")}>
                  ${r[3].toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scheduled payments */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Scheduled payments"
            subtitle="Next 30 days · $812,400 total"
            right={
              <Button variant="outline" size="sm" className="gap-1.5">
                <PlusIcon className="h-3.5 w-3.5" />Add
              </Button>
            }
          />
          <div className="mt-3 space-y-1">
            {SCHEDULED.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center px-1 py-2 rounded-lg hover:bg-gray-50 transition">
                <div className="col-span-5 flex items-center gap-2.5">
                  <AvatarBadge name={r[0]} size={28} />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{r[0]}</div>
                    <div className="text-[11px] text-gray-500 truncate">{r[1]}</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <Tag tone={r[4] as "amber" | "green" | "brand"}>{r[2]}</Tag>
                </div>
                <div className="col-span-3 text-[12px] text-gray-700">{r[3]}</div>
                <div className="col-span-1 text-right text-gray-400">
                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval queue */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Approval queue"
            subtitle="2 need you"
            right={<Tag tone="rose">2 pending</Tag>}
          />
          <div className="mt-3 space-y-3">
            {APPROVALS.map((r, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12.5px] font-medium">{r[0]}</div>
                    <div className="text-[11px] text-gray-500">{r[2]} · {r[3]}</div>
                  </div>
                  <div className="text-right tabular-nums font-semibold">{r[1]}</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" className="flex-1 justify-center">Approve</Button>
                  <Button variant="outline" size="sm" className="flex-1 justify-center">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
