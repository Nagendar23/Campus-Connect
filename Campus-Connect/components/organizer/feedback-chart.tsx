"use client"

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { event: "Event 1", rating: 4.2, responses: 45 },
  { event: "Event 2", rating: 4.5, responses: 67 },
  { event: "Event 3", rating: 4.1, responses: 32 },
  { event: "Event 4", rating: 4.8, responses: 89 },
  { event: "Event 5", rating: 4.6, responses: 56 },
  { event: "Event 6", rating: 4.9, responses: 78 },
]

export function FeedbackChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="event"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[3.5, 5]}
          tickFormatter={(value) => `${value}★`}
        />

        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) return null

            const rating = payload.find(
              (p) => p.dataKey === "rating"
            )?.value

            // responses are NOT in payload because they are not a Line
            // so we read them from the original data instead
            const responses = data.find(
              (d) => d.event === label
            )?.responses

            return (
              <div className="rounded-lg border bg-background p-3 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                    {label}
                  </span>

                  {rating !== undefined && (
                    <span className="font-bold text-yellow-500">
                      Rating: {rating}★
                    </span>
                  )}

                  {responses !== undefined && (
                    <span className="font-bold text-muted-foreground">
                      Responses: {responses}
                    </span>
                  )}
                </div>
              </div>
            )
          }}
        />

        <Line
          type="monotone"
          dataKey="rating"
          strokeWidth={3}
          dot={false}
          activeDot={{
            r: 6,
            style: {
              fill: "hsl(var(--primary))",
              opacity: 0.8,
            },
          }}
          style={{
            stroke: "hsl(var(--primary))",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
