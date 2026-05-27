"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type Package = {
  id: string
  title: string
  amount: number
  description?: string
}

export function SponsorMarketplace({ items = [] as Package[] }: { items?: Package[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle>{p.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-sm text-muted-foreground">{p.description}</div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">${p.amount}</div>
              <Button variant="outline">Request</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SponsorMarketplace
