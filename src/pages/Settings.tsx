import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Users, 
  MapPin,
  Save,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Loader2,
  CheckCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

interface SettingsData {
  notifications: {
    email: boolean;
    sms: boolean;
    autoResponse: boolean;
    highThreshold: string;
    responseTime: number;
  };
  security: {
    maintenanceMode: boolean;
    sessionTimeout: string;
    passwordPolicy: string;
  };
  devices: {
    pingInterval: number;
    batteryThreshold: number;
    connectivity: string;
  };
  geographic: {
    centerLat: number;
    centerLng: number;
    coverageRadius: number;
    emergencyContacts: {
      forestOfficer: string;
      rangerStation: string;
      emergencyServices: string;
    };
  };
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      sms: false,
      autoResponse: true,
      highThreshold: "gunshot",
      responseTime: 15
    },
    security: {
      maintenanceMode: false,
      sessionTimeout: "8",
      passwordPolicy: "standard"
    },
    devices: {
      pingInterval: 5,
      batteryThreshold: 20,
      connectivity: "lora"
    },
    geographic: {
      centerLat: 11.7000,
      centerLng: 76.5800,
      coverageRadius: 25,
      emergencyContacts: {
        forestOfficer: "+91-XXXXXXXXXX",
        rangerStation: "+91-XXXXXXXXXX",
        emergencyServices: "100"
      }
    }
  });

  // System status state
  const [systemStatus, setSystemStatus] = useState({
    database: "Online",
    api: "Operational", 
    alerts: "Active",
    uptime: "99.8%",
    responseTime: "200ms",
    storageUsed: "2.4 GB"
  });

  // New device registration
  const [newDeviceId, setNewDeviceId] = useState("");
  const [addingDevice, setAddingDevice] = useState(false);
  const [applyDeviceId, setApplyDeviceId] = useState("");
  const [applyingSettings, setApplyingSettings] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    loadSystemStatus();
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      // const response = await fetch('/api/settings');
      // const data = await response.json();
      // setSettings(data);
      
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem('bandipur-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: "Settings Load Failed",
        description: "Could not load settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStatus = async () => {
    try {
      // Check API health
      const response = await fetch('http://localhost:4000');
      if (response.ok) {
        setSystemStatus(prev => ({
          ...prev,
          api: "Operational"
        }));
      } else {
        setSystemStatus(prev => ({
          ...prev,
          api: "Degraded"
        }));
      }
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        api: "Offline"
      }));
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage (in real app, this would be API call)
      localStorage.setItem('bandipur-settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
        action: <CheckCircle className="h-4 w-4 text-success" />,
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save Failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      notifications: {
        email: true,
        sms: false,
        autoResponse: true,
        highThreshold: "gunshot",
        responseTime: 15
      },
      security: {
        maintenanceMode: false,
        sessionTimeout: "8",
        passwordPolicy: "standard"
      },
      devices: {
        pingInterval: 5,
        batteryThreshold: 20,
        connectivity: "lora"
      },
      geographic: {
        centerLat: 11.7000,
        centerLng: 76.5800,
        coverageRadius: 25,
        emergencyContacts: {
          forestOfficer: "+91-XXXXXXXXXX",
          rangerStation: "+91-XXXXXXXXXX",
          emergencyServices: "100"
        }
      }
    });
    
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to defaults.",
    });
  };

  const addNewDevice = async () => {
    if (!newDeviceId.trim()) {
      toast({
        title: "Device ID Required",
        description: "Please enter a device ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingDevice(true);
      
      // Call real API to add device
      const deviceData = {
        device_id: newDeviceId.trim(),
        name: `Device ${newDeviceId.trim()}`,
        location: {
          lat: settings.geographic.centerLat,
          lng: settings.geographic.centerLng,
          zone: "New Device Zone"
        },
        connectivity: settings.devices.connectivity
      };
      
      const result = await apiService.addDevice(deviceData);

toast({
  title: "Device Added Successfully",
  description: `Device ${newDeviceId} has been registered and is now online.`,
  action: <CheckCircle className="h-4 w-4 text-success" />,
});

setNewDeviceId("");

// Refresh device list in other components
window.dispatchEvent(new CustomEvent("deviceAdded", { detail: result }));

      
    } catch (error) {
      console.error('Failed to add device:', error);
      toast({
        title: "Add Device Failed",
        description: "Could not add device. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setAddingDevice(false);
    }
  };

  const applySettingsToDevice = async () => {
    if (!applyDeviceId.trim()) {
      toast({
        title: "Device ID Required",
        description: "Enter a device ID to apply settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplyingSettings(true);
      await apiService.updateDeviceSettings(applyDeviceId.trim(), {
        ping_interval: settings.devices.pingInterval,
        battery_threshold: settings.devices.batteryThreshold,
        connectivity: settings.devices.connectivity,
      });
      toast({
        title: "Settings Applied",
        description: `Settings updated for device ${applyDeviceId}.`,
        action: <CheckCircle className="h-4 w-4 text-success" />,
      });
    } catch (error) {
      console.error('Failed to apply settings:', error);
      toast({
        title: "Apply Failed",
        description: "Could not apply settings. Try again.",
        variant: "destructive",
      });
    } finally {
      setApplyingSettings(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure wildlife protection system preferences and security</p>
          {hasChanges && (
            <p className="text-sm text-warning mt-1 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              You have unsaved changes
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetToDefaults}
            disabled={saving || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reset to Defaults
          </Button>
          <Button 
            size="sm" 
            onClick={saveSettings}
            disabled={saving || loading || !hasChanges}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Alert Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert & Notification Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">Configure how alerts are processed and delivered</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch 
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSetting('notifications.email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                </div>
                <Switch 
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => updateSetting('notifications.sms', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-response">Auto-Response Mode</Label>
                  <p className="text-sm text-muted-foreground">Automatically trigger response protocols</p>
                </div>
                <Switch 
                  id="auto-response"
                  checked={settings.notifications.autoResponse}
                  onCheckedChange={(checked) => updateSetting('notifications.autoResponse', checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Alert Severity Thresholds</Label>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="high-threshold" className="text-sm">High Priority Threshold</Label>
                  <Select 
                    value={settings.notifications.highThreshold}
                    onValueChange={(value) => updateSetting('notifications.highThreshold', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gunshot">Gunshots & Chainsaws</SelectItem>
                      <SelectItem value="all">All Alert Types</SelectItem>
                      <SelectItem value="manual">Manual Classification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-time" className="text-sm">Response Time Target (minutes)</Label>
                  <Input 
                    id="response-time" 
                    type="number" 
                    value={settings.notifications.responseTime}
                    onChange={(e) => updateSetting('notifications.responseTime', parseInt(e.target.value) || 15)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access Control
            </CardTitle>
            <p className="text-sm text-muted-foreground">Manage user access and system security</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable monitoring</p>
              </div>
              <Switch 
                id="maintenance-mode"
                checked={settings.security.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('security.maintenanceMode', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Session Management</Label>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout" className="text-sm">Session Timeout (hours)</Label>
                  <Select 
                    value={settings.security.sessionTimeout}
                    onValueChange={(value) => updateSetting('security.sessionTimeout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-policy" className="text-sm">Password Policy</Label>
                  <Select 
                    value={settings.security.passwordPolicy}
                    onValueChange={(value) => updateSetting('security.passwordPolicy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="standard">Standard (12+ chars, mixed)</SelectItem>
                      <SelectItem value="strict">Strict (16+ chars, complex)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Device Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">Configure IoT sensors and network settings</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ping-interval">Device Ping Interval (minutes)</Label>
                <Input 
                  id="ping-interval" 
                  type="number" 
                  value={settings.devices.pingInterval}
                  onChange={(e) => updateSetting('devices.pingInterval', parseInt(e.target.value) || 5)}
                />
                <p className="text-xs text-muted-foreground">How often devices check in with the system</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="battery-threshold">Low Battery Alert (%)</Label>
                <Input 
                  id="battery-threshold" 
                  type="number" 
                  value={settings.devices.batteryThreshold}
                  onChange={(e) => updateSetting('devices.batteryThreshold', parseInt(e.target.value) || 20)}
                />
                <p className="text-xs text-muted-foreground">Battery level to trigger maintenance alerts</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectivity">Default Connectivity</Label>
                <Select 
                  value={settings.devices.connectivity}
                  onValueChange={(value) => updateSetting('devices.connectivity', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lora">LoRa Network</SelectItem>
                    <SelectItem value="gsm">GSM/Cellular</SelectItem>
                    <SelectItem value="wifi">WiFi</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Register New Device</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Device ID (e.g., SEN-019)" 
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                />
                <Button 
                  size="sm" 
                  onClick={addNewDevice}
                  disabled={addingDevice || !newDeviceId.trim()}
                >
                  {addingDevice ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Device'
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Apply Settings to Device</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Target Device ID (e.g., SEN-001)" 
                  value={applyDeviceId}
                  onChange={(e) => setApplyDeviceId(e.target.value)}
                />
                <Button 
                  size="sm" 
                  onClick={applySettingsToDevice}
                  disabled={applyingSettings || !applyDeviceId.trim()}
                >
                  {applyingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Settings'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sends ping interval, battery threshold, and connectivity to backend for this device.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Configuration
            </CardTitle>
            <p className="text-sm text-muted-foreground">Manage forest zones and coverage areas</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="center-lat">Map Center Latitude</Label>
                <Input 
                  id="center-lat" 
                  value={settings.geographic.centerLat}
                  onChange={(e) => updateSetting('geographic.centerLat', parseFloat(e.target.value) || 11.7000)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="center-lng">Map Center Longitude</Label>
                <Input 
                  id="center-lng" 
                  value={settings.geographic.centerLng}
                  onChange={(e) => updateSetting('geographic.centerLng', parseFloat(e.target.value) || 76.5800)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage-radius">Coverage Radius (km)</Label>
                <Input 
                  id="coverage-radius" 
                  type="number" 
                  value={settings.geographic.coverageRadius}
                  onChange={(e) => updateSetting('geographic.coverageRadius', parseInt(e.target.value) || 25)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Emergency Contacts</Label>
              <div className="space-y-2">
                <Input 
                  placeholder="Forest Officer Contact" 
                  value={settings.geographic.emergencyContacts.forestOfficer}
                  onChange={(e) => updateSetting('geographic.emergencyContacts.forestOfficer', e.target.value)}
                />
                <Input 
                  placeholder="Ranger Station" 
                  value={settings.geographic.emergencyContacts.rangerStation}
                  onChange={(e) => updateSetting('geographic.emergencyContacts.rangerStation', e.target.value)}
                />
                <Input 
                  placeholder="Emergency Services" 
                  value={settings.geographic.emergencyContacts.emergencyServices}
                  onChange={(e) => updateSetting('geographic.emergencyContacts.emergencyServices', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">System Status</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Database</span>
                    <Badge variant="outline" className={`${
                      systemStatus.database === 'Online' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {systemStatus.database}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Services</span>
                    <Badge variant="outline" className={`${
                      systemStatus.api === 'Operational' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : systemStatus.api === 'Degraded'
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {systemStatus.api}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Alert Processing</span>
                    <Badge variant="outline" className={`${
                      systemStatus.alerts === 'Active' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {systemStatus.alerts}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Performance Metrics</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm">{systemStatus.uptime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="text-sm">{systemStatus.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Storage Used</span>
                    <span className="text-sm">{systemStatus.storageUsed}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Version Information</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dashboard</span>
                    <span className="text-sm">v2.1.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API</span>
                    <span className="text-sm">v1.8.2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Update</span>
                    <span className="text-sm">Jan 15, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}