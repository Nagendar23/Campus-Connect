"use client"

import { ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts"
import { type Event as ApiEvent } from "@/lib/api"
import { useMemo } from "react"

interface AnalyticsChartProps {
  events?: ApiEvent[]
}

export function AnalyticsChart({ events = [] }: AnalyticsChartProps) {
  // Generate data from real events grouped by month
  const data = useMemo(() => {
    if (events.length === 0) {
      // Return empty data structure if no events
      return []
    }

    // Get last 6 months
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        registrations: 0,
        attendees: 0
      })
    }

    // Count events per month
    events.forEach(event => {
      const eventDate = new Date(event.startTime)
      const monthData = months.find(m => 
        m.monthIndex === eventDate.getMonth() && 
        m.year === eventDate.getFullYear()
      )
      if (monthData) {
        monthData.registrations += event.registeredCount || 0
        monthData.attendees += event.checkedInCount || 0
      }
    })

    return months
  }, [events])

  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No data available yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                      <span className="font-bold text-primary">Registrations: {payload[0].value}</span>
                      <span className="font-bold text-green-500">Attendees: {payload[1].value}</span>
                      <span className="text-sm text-muted-foreground">
                        Conversion: {Math.round(((payload[1].value as number) / (payload[0].value as number)) * 100)}%
                      </span>
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
          dataKey="registrations"
          stackId="1"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          opacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="attendees"
          stackId="2"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          opacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
