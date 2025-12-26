"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Aug", revenue: 2400, target: 2000 },
  { month: "Sep", revenue: 3200, target: 2500 },
  { month: "Oct", revenue: 2800, target: 3000 },
  { month: "Nov", revenue: 4100, target: 3500 },
  { month: "Dec", revenue: 3600, target: 4000 },
  { month: "Jan", revenue: 5200, target: 4500 },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                      <span className="font-bold text-green-500">Revenue: ${payload[0].value}</span>
                      <span className="font-bold text-muted-foreground">Target: ${payload[1].value}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="target"
          stackId="1"
          stroke="hsl(var(--muted-foreground))"
          fill="hsl(var(--muted-foreground))"
          opacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stackId="2"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          opacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
