import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Radio, 
  Battery, 
  Signal, 
  MapPin, 
  Calendar,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { apiService, Device } from "@/lib/api";

const getStatusColor = (status: string) => {
  switch (status) {
    case "online": return "text-success";
    case "offline": return "text-destructive";
    case "maintenance": return "text-warning";
    default: return "text-muted-foreground";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "online": return "bg-success/10 text-success border-success/20";
    case "offline": return "bg-destructive/10 text-destructive border-destructive/20";
    case "maintenance": return "bg-warning/10 text-warning border-warning/20";
    default: return "bg-muted/10 text-muted-foreground border-muted/20";
  }
};

const getBatteryColor = (battery: number) => {
  if (battery > 60) return "text-success";
  if (battery > 30) return "text-warning";
  return "text-destructive";
};

export default function DeviceStatus() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDevices();
      setDevices(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch devices:", err);
      setError("Failed to load devices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Listen for new devices added from settings
    const handleDeviceAdded = () => {
      fetchDevices();
    };
    
    window.addEventListener('deviceAdded', handleDeviceAdded);
    
    // Set up auto-refresh every 30 seconds if enabled
    const interval = setInterval(() => {
      if (isAutoRefresh) {
        fetchDevices();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('deviceAdded', handleDeviceAdded);
      clearInterval(interval);
    };
  }, []);

  const onlineDevices = devices.filter(d => d.status === "online").length;
  const totalDevices = devices.length;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Device Monitoring</h1>
          <p className="text-muted-foreground">IoT sensor network status and health monitoring</p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span>Auto-refresh {isAutoRefresh ? 'ON' : 'OFF'}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isAutoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDevices}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{totalDevices}</p>
              </div>
              <Radio className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-success">{onlineDevices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-destructive">
                  {devices.filter(d => d.status === "offline").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Health</p>
                <p className="text-2xl font-bold text-success">
                  {Math.round((onlineDevices / totalDevices) * 100)}%
                </p>
              </div>
              <Signal className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && devices.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Device Grid */}
      {!loading && devices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {devices.map((device) => (
          <Card key={device.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{device.device_id}</p>
                </div>
                <Badge variant="outline" className={getStatusBadge(device.status)}>
                  {device.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Battery</span>
                    <span className={getBatteryColor(device.battery)}>{device.battery}%</span>
                  </div>
                  <Progress value={device.battery} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Signal</span>
                    <span className="text-foreground">{device.signal_strength}%</span>
                  </div>
                  <Progress value={device.signal_strength} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{device.location.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last ping: {formatTime(device.last_ping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    <span>{device.connectivity} • Uptime: {device.uptime_percentage}%</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {device.alerts_count} alerts
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && devices.length === 0 && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Devices Found</h3>
            <p className="text-muted-foreground">No devices are currently registered in the system.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}