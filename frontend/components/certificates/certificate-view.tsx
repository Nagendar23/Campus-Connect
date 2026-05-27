"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CertificateView({ recipient, eventName, url }: { recipient: string; eventName: string; url: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm">Recipient: <strong>{recipient}</strong></div>
          <div className="text-sm">Event: <strong>{eventName}</strong></div>
          <div>
            <Button asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">Download Certificate</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CertificateView
