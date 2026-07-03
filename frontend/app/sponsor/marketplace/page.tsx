"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { api, type SponsorOpportunity } from "@/lib/api"
import { useEffect, useMemo, useState } from "react"

export default function SponsorMarketplacePage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<SponsorOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [minAmount, setMinAmount] = useState("")
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadOpportunities = async () => {
      try {
        setLoading(true)
        setError(null)
        const items = await api.listSponsorOpportunities()
        if (mounted) {
          setOpportunities(items)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load opportunities")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadOpportunities()

    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const min = Number(minAmount)
    return opportunities.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesText =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase())
      const matchesAmount = Number.isNaN(min) || !minAmount ? true : (item.targetAmount || 0) >= min
      return matchesStatus && matchesText && matchesAmount
    })
  }, [opportunities, search, statusFilter, minAmount])

  const requestIntro = (title: string) => {
    setNotice(`Request sent for ${title}.`)
  }

  return (
    <AuthGuard requiredRole="sponsor">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="sponsor" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Marketplace</h1>
                <p className="text-muted-foreground">Discover events looking for sponsors</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Event Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading opportunities...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : opportunities.length === 0 ? (
                    <p>No opportunities available yet.</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2">
                          <Label>Search</Label>
                          <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search opportunities"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="fulfilled">Fulfilled</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Minimum Amount</Label>
                          <Input
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            placeholder="$0"
                          />
                        </div>
                      </div>

                      {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

                      {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No matching opportunities.</p>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {filtered.map((item) => (
                            <Card key={item._id}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">{item.title}</CardTitle>
                                  <Badge variant={item.status === "open" ? "default" : "secondary"}>
                                    {item.status}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {item.description ? (
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                ) : null}
                                <div className="flex flex-wrap gap-2">
                                  {item.packageTitle ? (
                                    <Badge variant="outline">Package: {item.packageTitle}</Badge>
                                  ) : null}
                                  {typeof item.targetAmount === "number" ? (
                                    <Badge variant="outline">Target: ${item.targetAmount}</Badge>
                                  ) : null}
                                </div>
                                <Button onClick={() => requestIntro(item.title)} className="w-full">
                                  Request Intro
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
