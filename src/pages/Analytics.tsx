import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, TrendingUp, TrendingDown, AlertTriangle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Mock analytics data
const weeklyAlerts = [
  { day: "Mon", gunshots: 2, chainsaws: 1, vehicles: 3, total: 6 },
  { day: "Tue", gunshots: 0, chainsaws: 0, vehicles: 1, total: 1 },
  { day: "Wed", gunshots: 1, chainsaws: 2, vehicles: 2, total: 5 },
  { day: "Thu", gunshots: 3, chainsaws: 0, vehicles: 1, total: 4 },
  { day: "Fri", gunshots: 1, chainsaws: 1, vehicles: 4, total: 6 },
  { day: "Sat", gunshots: 2, chainsaws: 3, vehicles: 2, total: 7 },
  { day: "Sun", gunshots: 0, chainsaws: 1, vehicles: 1, total: 2 }
];

const monthlyTrend = [
  { month: "Jan", alerts: 45, incidents: 12 },
  { month: "Feb", alerts: 38, incidents: 8 },
  { month: "Mar", alerts: 52, incidents: 15 },
  { month: "Apr", alerts: 41, incidents: 10 },
  { month: "May", alerts: 47, incidents: 13 },
  { month: "Jun", alerts: 35, incidents: 7 }
];

const alertTypes = [
  { name: "Vehicle Movement", value: 45, color: "#8B5CF6" },
  { name: "Gunshots", value: 28, color: "#EF4444" },
  { name: "Chainsaw Activity", value: 18, color: "#F59E0B" },
  { name: "Animal Distress", value: 9, color: "#10B981" }
];

const devicePerformance = [
  { device: "SEN-001", uptime: 99.2, alerts: 15 },
  { device: "SEN-004", uptime: 95.8, alerts: 8 },
  { device: "SEN-007", uptime: 67.3, alerts: 22 },
  { device: "SEN-012", uptime: 98.9, alerts: 12 },
  { device: "SEN-015", uptime: 78.1, alerts: 5 },
  { device: "SEN-018", uptime: 96.7, alerts: 18 }
];

export default function Analytics() {
  const totalAlerts = weeklyAlerts.reduce((sum, day) => sum + day.total, 0);
  const avgDailyAlerts = Math.round(totalAlerts / 7 * 10) / 10;
  const highestAlertDay = weeklyAlerts.reduce((max, day) => day.total > max.total ? day : max);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Wildlife protection statistics and trend analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts (7d)</p>
                <p className="text-2xl font-bold">{totalAlerts}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  12% vs last week
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{avgDailyAlerts}</p>
                <p className="text-xs text-warning flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  2% vs last week
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Day</p>
                <p className="text-2xl font-bold">{highestAlertDay.day}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {highestAlertDay.total} alerts
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  5% vs last week
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly Alert Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Alert Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">Alert types by day over the past week</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyAlerts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="gunshots" stackId="a" fill="#EF4444" name="Gunshots" />
                <Bar dataKey="chainsaws" stackId="a" fill="#F59E0B" name="Chainsaws" />
                <Bar dataKey="vehicles" stackId="a" fill="#8B5CF6" name="Vehicles" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alert Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Type Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown of alert types over the selected period</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={alertTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {alertTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {alertTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm">{type.name}</span>
                    </div>
                    <span className="text-sm font-medium">{type.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">Alert patterns and response efficiency over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="alerts" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Total Alerts"
                />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Confirmed Incidents"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Device Performance Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Sensor uptime and alert generation statistics</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devicePerformance.map((device) => (
                <div key={device.device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{device.device}</span>
                      <Badge variant="outline" className="text-xs">
                        {device.alerts} alerts
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {device.uptime}% uptime
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        device.uptime > 95 ? 'bg-success' : 
                        device.uptime > 80 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${device.uptime}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}