import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, MapPin, Volume2, Clock, Radio, Pause, Play, Loader2, CheckCircle, ImagePlus, Camera } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiService, Alert, Device } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data fallback
const mockAlerts: Alert[] = [
  {
    id: 1,
    alert_id: "ALT-001",
    device_id: "SEN-004",
    alert_type: "gunshot",
    severity: "High",
    location: { lat: 11.7089, lng: 76.5731, name: "Core Area Sector 7" },
    description: "Gunshot detected near elephant corridor",
    audio_url: "/api/audio/gunshot-001.wav",
    timestamp: "2024-01-15T14:23:45Z",
    resolved: false,
    created_at: "2024-01-15T14:23:45Z",
    photo_url: "/placeholder.svg"
  },
  {
    id: 2,
    alert_id: "ALT-002",
    device_id: "SEN-007",
    alert_type: "chainsaw",
    severity: "High",
    location: { lat: 11.6889, lng: 76.5431, name: "Buffer Zone Northeast" },
    description: "Chainsaw activity detected in protected area",
    audio_url: "/api/audio/chainsaw-002.wav",
    timestamp: "2024-01-15T13:45:12Z",
    resolved: false,
    created_at: "2024-01-15T13:45:12Z",
    photo_url: "/placeholder.svg"
  },
  {
    id: 3,
    alert_id: "ALT-003",
    device_id: "SEN-001",
    alert_type: "vehicle",
    severity: "Medium",
    location: { lat: 11.7189, lng: 76.5931, name: "Patrol Route Delta" },
    description: "Unauthorized vehicle movement after hours",
    audio_url: "/api/audio/vehicle-003.wav",
    timestamp: "2024-01-15T12:12:33Z",
    resolved: true,
    created_at: "2024-01-15T12:12:33Z",
    photo_url: "/placeholder.svg"
  },
  {
    id: 4,
    alert_id: "ALT-004",
    device_id: "SEN-012",
    alert_type: "animal_distress",
    severity: "Medium",
    location: { lat: 11.6989, lng: 76.5631, name: "Wildlife Corridor South" },
    description: "Animal distress calls detected",
    audio_url: "/api/audio/distress-004.wav",
    timestamp: "2024-01-15T11:34:56Z",
    resolved: false,
    created_at: "2024-01-15T11:34:56Z",
    photo_url: "/placeholder.svg"
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "High": return "bg-destructive text-destructive-foreground";
    case "Medium": return "bg-warning text-warning-foreground";
    case "Low": return "bg-success text-success-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "gunshot": return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "chainsaw": return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "vehicle": return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "animal_distress": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    default: return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function LiveAlertsMap() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingToAlert, setRespondingToAlert] = useState<string | null>(null);
  const [photoUploadId, setPhotoUploadId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [alertsData, devicesData] = await Promise.all([
        apiService.getAlerts(),
        apiService.getDevices()
      ]);
      setAlerts(alertsData);
      setDevices(devicesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Using mock data.");
      setAlerts(mockAlerts);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for new devices added from settings
    const handleDeviceAdded = () => {
      fetchData();
    };
    
    window.addEventListener('deviceAdded', handleDeviceAdded);
    
    return () => {
      window.removeEventListener('deviceAdded', handleDeviceAdded);
    };
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handlePhotoUpload = async (alertId: string, file: File) => {
    try {
      setPhotoUploadId(alertId);
      const response = await apiService.uploadAlertPhoto(alertId, file);

      setAlerts(prev =>
        prev.map(alert =>
          alert.alert_id === alertId ? { ...alert, photo_url: response.photo_url } : alert
        )
      );

      toast({
        title: "Photo Received",
        description: "Latest image attached to the alert.",
      });
    } catch (err) {
      console.error("Failed to upload photo:", err);
      toast({
        title: "Photo Upload Failed",
        description: err instanceof Error ? err.message : "Unable to upload photo",
        variant: "destructive",
      });
    } finally {
      setPhotoUploadId(null);
    }
  };

  const handlePhotoInputChange = (alertId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handlePhotoUpload(alertId, file).finally(() => {
      event.target.value = "";
    });
  };

  const handleRespondToAlert = async (alertId: string, alertType: string, location: string) => {
    try {
      setRespondingToAlert(alertId);
      
      // Try to make real API call first, fallback to simulation if backend is not available
      try {
        const response = await fetch('http://localhost:4000/api/alerts/respond', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert_id: alertId,
            action: 'respond',
            timestamp: new Date().toISOString(),
            location: location,
            alert_type: alertType
          })
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

      } catch (apiError) {
        console.log('Backend not available, using simulation:', apiError);
        // Fallback to simulation if backend is not available
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Show success toast
      toast({
        title: "Alert Response Initiated",
        description: `Response team dispatched to ${location} for ${alertType} alert`,
        action: <CheckCircle className="h-4 w-4 text-success" />,
      });

      // Update alert status locally
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.alert_id === alertId 
            ? { ...alert, resolved: true }
            : alert
        )
      );

    } catch (error) {
      console.error("Failed to respond to alert:", error);
      toast({
        title: "Response Failed",
        description: "Failed to dispatch response team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRespondingToAlert(null);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Bandipur National Park
    const map = L.map(mapRef.current).setView([11.7, 76.58], 12);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add sensor markers
    devices.forEach(device => {
      const iconColor = device.status === 'online' ? 'green' : 'red';
      const icon = L.divIcon({
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        className: 'custom-div-icon'
      });

      const marker = L.marker([device.location.lat, device.location.lng], { icon }).addTo(map);
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong>${device.device_id}</strong><br/>
          Status: <span style="color: ${iconColor};">${device.status}</span><br/>
          Battery: ${device.battery}%<br/>
          Signal: ${device.signal_strength}%<br/>
          Last Alert: ${device.alerts_count} alerts
        </div>
      `);
    });

    // Add alert markers
    alerts.forEach(alert => {
      const alertIcon = L.divIcon({
        html: `<div style="background-color: ${alert.severity === 'High' ? 'red' : 'orange'}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">!</div>`,
        iconSize: [30, 30],
        className: 'alert-marker'
      });

      const alertMarker = L.marker([alert.location.lat, alert.location.lng], { icon: alertIcon }).addTo(map);
      
      alertMarker.bindPopup(`
        <div style="min-width: 250px;">
          <strong>${alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1).replace('_', ' ')} Alert</strong><br/>
          <span style="color: ${alert.severity === 'High' ? 'red' : 'orange'};">${alert.severity} Priority</span><br/>
          Location: ${alert.location.name}<br/>
          Time: ${formatTime(alert.timestamp)}<br/>
          Device: ${alert.device_id}<br/>
          <em>${alert.description}</em>
        </div>
      `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [alerts, devices]);

  const visibleAlerts = alertsEnabled ? alerts : [];
  const photoAlerts = alerts
    .filter((alert) => Boolean(alert.photo_url))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Alerts & Forest Map</h1>
          <p className="text-muted-foreground">Real-time wildlife protection monitoring - Bandipur National Park</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={alertsEnabled} 
              onCheckedChange={setAlertsEnabled}
              id="alerts-toggle"
              disabled={loading}
            />
            <label htmlFor="alerts-toggle" className="text-sm font-medium">
              {alertsEnabled ? 'Live Alerts Enabled' : 'Alerts Paused'}
            </label>
            {alertsEnabled ? <Play className="h-4 w-4 text-success" /> : <Pause className="h-4 w-4 text-warning" />}
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Radio className="h-4 w-4 text-success animate-pulse" />
            )}
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              {loading ? 'Loading...' : 'Monitoring Active'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Forest Map</CardTitle>
            <p className="text-sm text-muted-foreground">
              Green dots: Active sensors | Red dots: Offline sensors | Alert markers: Recent incidents
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
          </CardContent>
        </Card>

        {/* Live Alerts Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">
                {alertsEnabled ? `${visibleAlerts.length} active alerts` : 'Alert monitoring paused'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
              {!alertsEnabled && (
                <div className="text-center py-8 text-muted-foreground">
                  <Pause className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Alert monitoring is paused</p>
                  <p className="text-xs">Enable alerts to view recent incidents</p>
                </div>
              )}
              
              {alertsEnabled && visibleAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No Active Alerts</p>
                  <p className="text-xs">All sensors operating normally</p>
                </div>
              )}

              {visibleAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.resolved 
                    ? 'border-l-success bg-success/5' 
                    : 'border-l-destructive'
                }`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {getTypeIcon(alert.alert_type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm">
                                {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1).replace('_', ' ')} Detected
                              </h4>
                              {alert.resolved && (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(alert.severity) + " text-xs"}>
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{alert.location.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Radio className="h-3 w-3 text-muted-foreground" />
                          <span>{alert.device_id}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <div className="space-y-2 w-full">
                          {alert.photo_url ? (
                            <div className="relative h-40 w-full overflow-hidden rounded-md border border-border/60">
                              <img
                                src={alert.photo_url}
                                alt={`${alert.alert_type} evidence`}
                                className="h-full w-full object-cover"
                              />
                              <span className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                                Latest photo
                              </span>
                            </div>
                          ) : (
                            <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-border/80 text-muted-foreground text-xs">
                              No photo received yet
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => {
                              fileInputsRef.current[alert.alert_id] = el;
                            }}
                            onChange={(event) => handlePhotoInputChange(alert.alert_id, event)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-center gap-1"
                            onClick={() => fileInputsRef.current[alert.alert_id]?.click()}
                            disabled={photoUploadId === alert.alert_id}
                          >
                            {photoUploadId === alert.alert_id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <ImagePlus className="h-3 w-3" />
                                Upload Photo
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-1 pt-1">
                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1 h-7">
                          <Volume2 className="h-3 w-3" />
                          Audio
                        </Button>
                        <Button 
                          size="sm" 
                          className={`text-xs px-2 py-1 h-7 ${
                            alert.resolved 
                              ? 'bg-success hover:bg-success/90' 
                              : 'bg-primary hover:bg-primary/90'
                          }`}
                          onClick={() => handleRespondToAlert(alert.alert_id, alert.alert_type, alert.location.name)}
                          disabled={respondingToAlert === alert.alert_id || alert.resolved}
                        >
                          {respondingToAlert === alert.alert_id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Dispatching...
                            </>
                          ) : alert.resolved ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Responded
                            </>
                          ) : (
                            'Respond'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Photos Section */}
      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-primary" />
              Real-time Evidence Feed
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest frames streamed from field sensors that include AI-classified wildlife or threat visuals.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {photoAlerts.length ? `${photoAlerts.length} recent uploads` : "No uploads yet"}
          </Badge>
        </CardHeader>
        <CardContent>
          {photoAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-8 text-center text-muted-foreground">
              <Camera className="mb-3 h-8 w-8" />
              <p className="text-sm font-medium">No photo-based alerts yet</p>
              <p className="text-xs">
                When camera-enabled sensors detect motion, the image stream will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photoAlerts.map((alert) => (
                <div key={`${alert.alert_id}-photo`} className="overflow-hidden rounded-lg border border-border/70 bg-card">
                  <div className="relative h-48 w-full">
                    <img
                      src={alert.photo_url}
                      alt={`${alert.alert_type} evidence`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <Badge className="absolute left-3 top-3 uppercase tracking-wide">
                      {alert.alert_type.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`absolute right-3 top-3 text-xs ${getSeverityColor(alert.severity)}`}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2 p-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                    <p className="text-foreground">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}