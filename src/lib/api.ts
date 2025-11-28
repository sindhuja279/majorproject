export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface Device {
  id: number;
  device_id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  status: 'online' | 'offline' | 'maintenance';
  battery: number;
  signal_strength: number;
  connectivity: string;
  last_ping: string;
  alerts_count: number;
  uptime_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  alert_id: string;
  device_id: string;
  alert_type: 'gunshot' | 'chainsaw' | 'vehicle' | 'animal_distress';
  severity: 'High' | 'Medium' | 'Low';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  description: string;
  audio_url: string;
  photo_url?: string;
  timestamp: string;
  resolved: boolean;
  created_at: string;
}

export interface AnalyticsData {
  weeklyAlerts: Array<{
    day: string;
    gunshots: number;
    chainsaws: number;
    vehicles: number;
    total: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    alerts: number;
    incidents: number;
  }>;
  alertTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  summary: {
    totalAlerts: number;
    avgDailyAlerts: number;
    peakDay: string;
    responseRate: number;
    onlineDevices: number;
    totalDevices: number;
    networkHealth: number;
  };
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Devices API
  async getDevices(): Promise<Device[]> {
    const devices = await this.request<Device[]>('/devices');
    // Normalize to prevent UI crashes when backend rows are missing fields
    return (devices || []).map((d: any, idx: number) => {
      const location = d?.location ?? { lat: 0, lng: 0, zone: "Unknown" };
      return {
        id: Number(d?.id ?? idx + 1),
        device_id: String(d?.device_id ?? `UNKNOWN-${idx + 1}`),
        name: String(d?.name ?? `Device ${idx + 1}`),
        location: {
          lat: Number(location.lat ?? 0),
          lng: Number(location.lng ?? 0),
          zone: String(location.zone ?? "Unknown"),
        },
        status: (d?.status === 'online' || d?.status === 'offline' || d?.status === 'maintenance')
          ? d.status
          : 'offline',
        battery: Math.max(0, Math.min(100, Number(d?.battery ?? 0))),
        signal_strength: Math.max(0, Math.min(100, Number(d?.signal_strength ?? 0))),
        connectivity: String(d?.connectivity ?? 'unknown'),
        last_ping: String(d?.last_ping ?? new Date(0).toISOString()),
        alerts_count: Number(d?.alerts_count ?? 0),
        uptime_percentage: Number(d?.uptime_percentage ?? 0),
        created_at: String(d?.created_at ?? new Date(0).toISOString()),
        updated_at: String(d?.updated_at ?? new Date(0).toISOString()),
      } as Device;
    });
  }

  async createDevice(device: Partial<Device>): Promise<Device[]> {
    return this.request<Device[]>('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async addDevice(deviceData: { device_id: string; name: string; location?: any; connectivity?: string }): Promise<Device[]> {
    return this.request<Device[]>('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateDeviceSettings(deviceId: string, settings: { ping_interval: number; battery_threshold: number; connectivity: string }): Promise<any> {
    return this.request<any>(`/devices/${deviceId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getDeviceHealth(): Promise<any> {
    return this.request<any>('/devices/health');
  }

  // Alerts API
  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>('/alerts');
  }

  async createAlert(alert: Partial<Alert>): Promise<Alert[]> {
    return this.request<Alert[]>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  async uploadAlertPhoto(alertId: string, file: File): Promise<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/photo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Failed to upload photo');
    }

    return response.json();
  }

  // Analytics API
  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>('/analytics');
  }

  async getAnalyticsSummary(): Promise<AnalyticsData['summary']> {
    return this.request<AnalyticsData['summary']>('/analytics/summary');
  }

  // Health check
  async healthCheck(): Promise<{ message: string; status: string; timestamp: string; version: string }> {
    return this.request<{ message: string; status: string; timestamp: string; version: string }>('/');
  }
}

export const apiService = new ApiService();
