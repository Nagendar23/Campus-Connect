"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, Smartphone, Bell, Download, RefreshCw, Nfc } from "lucide-react"

interface IDCardSettingsProps {
  securityLevel: "basic" | "enhanced" | "maximum"
  onSecurityLevelChange: (level: "basic" | "enhanced" | "maximum") => void
  nfcSupported: boolean
}

export function IDCardSettings({ securityLevel, onSecurityLevelChange, nfcSupported }: IDCardSettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription>Configure security level and authentication methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Security Level</Label>
            <Select value={securityLevel} onValueChange={onSecurityLevelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      Basic
                    </Badge>
                    <span>Standard protection</span>
                  </div>
                </SelectItem>
                <SelectItem value="enhanced">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Enhanced
                    </Badge>
                    <span>Biometric + PIN</span>
                  </div>
                </SelectItem>
                <SelectItem value="maximum">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Maximum
                    </Badge>
                    <span>Multi-factor auth</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Biometric Lock</Label>
                <p className="text-sm text-muted-foreground">Require fingerprint/face ID</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Lock</Label>
                <p className="text-sm text-muted-foreground">Lock after 5 minutes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Screenshot Protection</Label>
                <p className="text-sm text-muted-foreground">Prevent screenshots</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Display Settings</span>
          </CardTitle>
          <CardDescription>Customize how your ID card appears</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Always Show QR Code</Label>
                <p className="text-sm text-muted-foreground">Display QR on lock screen</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>High Contrast</Label>
                <p className="text-sm text-muted-foreground">Better visibility</p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="space-y-3">
            <Label>QR Code Size</Label>
            <Select defaultValue="medium">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (100px)</SelectItem>
                <SelectItem value="medium">Medium (150px)</SelectItem>
                <SelectItem value="large">Large (200px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>Manage ID card related notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Expiry Reminders</Label>
              <p className="text-sm text-muted-foreground">30 days before expiry</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Suspicious activity</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Usage Notifications</Label>
              <p className="text-sm text-muted-foreground">When ID is scanned</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
          <CardDescription>Additional functionality and integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export ID Data
          </Button>

          <Button variant="outline" className="w-full justify-start bg-transparent">
            <RefreshCw className="mr-2 h-4 w-4" />
            Force Sync
          </Button>

          {nfcSupported && (
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Nfc className="mr-2 h-4 w-4" />
              Configure NFC
            </Button>
          )}

          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Smartphone className="mr-2 h-4 w-4" />
            Add to Apple Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
