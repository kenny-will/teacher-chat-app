"use client"

import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// ─── Sparkline ─────────────────────────────────────────────────
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  stroke = "#2A5CFF",
  fill = "#2A5CFF22",
}: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Area Chart ─────────────────────────────────────────────────
interface AreaChartProps {
  data: number[]
  labels?: string[]
  height?: number
  currency?: boolean
  color?: string
}

export function AreaChart({
  data,
  labels = [],
  height = 200,
  currency = true,
  color = "#2A5CFF",
}: AreaChartProps) {
  const chartData = data.map((v, i) => ({
    label: labels[i] ?? `${i}`,
    value: v,
  }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`areaGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#8A91A0" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #DDE1E7",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 2px 8px rgba(10,12,18,.08)",
          }}
          formatter={(val) => {
            const n = Number(val ?? 0)
            return currency
              ? [`$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, "Value"]
              : [n.toFixed(2) + "%", "Yield"]
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#areaGrad-${color.replace("#", "")})`}
          isAnimationActive={false}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

// ─── Bar Chart ───────────────────────────────────────────────────
interface BarChartProps {
  data: number[]
  stack?: number[]
  labels?: string[]
  height?: number
}

export function StackedBarChart({ data, stack = [], labels = [], height = 180 }: BarChartProps) {
  const chartData = data.map((v, i) => ({
    label: labels[i] ?? `${i}`,
    inflow: v,
    outflow: stack[i] ?? 0,
  }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#8A91A0" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #DDE1E7",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="inflow" fill="#2A5CFF" radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        <Bar dataKey="outflow" fill="#0A0C12" radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// ─── Donut Chart ─────────────────────────────────────────────────
interface DonutData {
  label?: string
  value: number
  color: string
  amount?: string
}

interface DonutChartProps {
  data: DonutData[]
  size?: number
  thickness?: number
}

export function DonutChart({ data, size = 140, thickness = 16 }: DonutChartProps) {
  const inner = (size / 2) - thickness
  return (
    <PieChart width={size} height={size}>
      <Pie
        data={data}
        cx={size / 2 - 1}
        cy={size / 2 - 1}
        innerRadius={inner}
        outerRadius={size / 2 - 2}
        dataKey="value"
        strokeWidth={0}
        isAnimationActive={false}
      >
        {data.map((entry, idx) => (
          <Cell key={idx} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  )
}

// ─── Candlestick Chart ──────────────────────────────────────────
interface CandleData {
  o: number
  c: number
  h: number
  l: number
}

interface CandleChartProps {
  data: CandleData[]
  height?: number
}

export function CandleChart({ data, height = 200 }: CandleChartProps) {
  const chartData = data.map((d, i) => ({
    i,
    open: d.o,
    close: d.c,
    high: d.h,
    low: d.l,
    positive: d.c >= d.o,
  }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
        <XAxis dataKey="i" hide />
        <YAxis domain={["auto", "auto"]} hide />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #DDE1E7",
            borderRadius: 8,
            fontSize: 11,
          }}
          formatter={(val, name) => [Number(val ?? 0).toFixed(2), String(name)]}
        />
        <Bar
          dataKey="close"
          isAnimationActive={false}
          maxBarSize={10}
          radius={[2, 2, 0, 0]}
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.positive ? "#10B981" : "#EF4444"} />
          ))}
        </Bar>
        <Line
          type="monotone"
          dataKey="high"
          stroke="#8A91A0"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
