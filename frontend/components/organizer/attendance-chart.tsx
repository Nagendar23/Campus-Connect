"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { day: "Mon", registered: 120, attended: 98 },
  { day: "Tue", registered: 89, attended: 76 },
  { day: "Wed", registered: 156, attended: 134 },
  { day: "Thu", registered: 203, attended: 189 },
  { day: "Fri", registered: 178, attended: 156 },
  { day: "Sat", registered: 234, attended: 198 },
  { day: "Sun", registered: 145, attended: 123 },
]

export function AttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                      <span className="font-bold text-blue-500">Registered: {payload[0].value}</span>
                      <span className="font-bold text-green-500">Attended: {payload[1].value}</span>
                      <span className="text-sm text-muted-foreground">
                        Rate: {Math.round(((payload[1].value as number) / (payload[0].value as number)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="registered" fill="hsl(var(--primary))" opacity={0.6} />
        <Bar dataKey="attended" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  )
}
