# Bandipur Watch Nexus - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## 1. Environment Setup

### Backend Environment Variables
Create a `backend/.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

### Getting Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API
3. Copy the Project URL and anon public key
4. For service role key, copy the service_role secret key

## 2. Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create devices table
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  location JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'offline',
  battery INTEGER DEFAULT 0,
  signal_strength INTEGER DEFAULT 0,
  connectivity VARCHAR(20) DEFAULT 'LoRa',
  last_ping TIMESTAMP WITH TIME ZONE,
  alerts_count INTEGER DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  alert_id VARCHAR(50) UNIQUE NOT NULL,
  device_id VARCHAR(50) REFERENCES devices(device_id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  location JSONB NOT NULL,
  description TEXT,
  audio_url VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  total_alerts INTEGER DEFAULT 0,
  gunshot_alerts INTEGER DEFAULT 0,
  chainsaw_alerts INTEGER DEFAULT 0,
  vehicle_alerts INTEGER DEFAULT 0,
  animal_distress_alerts INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO devices (device_id, name, location, status, battery, signal_strength, connectivity, last_ping, alerts_count, uptime_percentage) VALUES
('SEN-001', 'Core Area Sector 7', '{"lat": 11.7089, "lng": 76.5731, "zone": "Core Protected Zone"}', 'online', 85, 90, 'LoRa', NOW(), 3, 99.2),
('SEN-004', 'Buffer Zone Northeast', '{"lat": 11.6989, "lng": 76.5631, "zone": "Buffer Management Area"}', 'online', 72, 85, 'GSM', NOW(), 0, 95.8),
('SEN-007', 'Safari Route Checkpoint', '{"lat": 11.6889, "lng": 76.5431, "zone": "Tourist Safari Zone"}', 'offline', 15, 0, 'LoRa', NOW() - INTERVAL '1 day', 1, 67.3),
('SEN-012', 'Patrol Route Delta', '{"lat": 11.7189, "lng": 76.5931, "zone": "Anti-Poaching Patrol Route"}', 'online', 94, 92, 'GSM', NOW(), 2, 98.9),
('SEN-015', 'Elephant Corridor South', '{"lat": 11.7289, "lng": 76.5531, "zone": "Wildlife Corridor Management"}', 'maintenance', 45, 78, 'LoRa', NOW() - INTERVAL '6 hours', 0, 78.1),
('SEN-018', 'Water Source Monitor West', '{"lat": 11.6789, "lng": 76.5831, "zone": "Water Resource Management"}', 'online', 88, 87, 'GSM', NOW(), 1, 96.7);

-- Insert sample alerts
INSERT INTO alerts (alert_id, device_id, alert_type, severity, location, description, audio_url) VALUES
('ALT-001', 'SEN-004', 'gunshot', 'High', '{"lat": 11.7089, "lng": 76.5731, "name": "Core Area Sector 7"}', 'Gunshot detected near elephant corridor', '/api/audio/gunshot-001.wav'),
('ALT-002', 'SEN-007', 'chainsaw', 'High', '{"lat": 11.6889, "lng": 76.5431, "name": "Buffer Zone Northeast"}', 'Chainsaw activity detected in protected area', '/api/audio/chainsaw-002.wav'),
('ALT-003', 'SEN-001', 'vehicle', 'Medium', '{"lat": 11.7189, "lng": 76.5931, "name": "Patrol Route Delta"}', 'Unauthorized vehicle movement after hours', '/api/audio/vehicle-003.wav'),
('ALT-004', 'SEN-012', 'animal_distress', 'Medium', '{"lat": 11.6989, "lng": 76.5631, "name": "Wildlife Corridor South"}', 'Animal distress calls detected', '/api/audio/distress-004.wav');

-- Enable Row Level Security (RLS)
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Allow public read access" ON devices FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON analytics FOR SELECT USING (true);
```

## 3. Installation & Running

### Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Start Development Servers
```bash
# Terminal 1: Start frontend (runs on http://localhost:8080)
npm run dev

# Terminal 2: Start backend (runs on http://localhost:4000)
cd backend
npm run dev
```

## 4. Features

- **Live Alerts Map**: Real-time monitoring with interactive map
- **Device Status**: IoT sensor network monitoring
- **Analytics Dashboard**: Comprehensive reporting and trends
- **Real-time Updates**: Supabase subscriptions for live data

## 5. API Endpoints

- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create new device
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `GET /api/analytics` - Get analytics data

## Troubleshooting

1. **Backend won't start**: Check that all environment variables are set
2. **Database connection issues**: Verify Supabase credentials
3. **CORS errors**: Ensure CORS_ORIGIN matches your frontend URL
4. **Map not loading**: Check that Leaflet CSS is properly imported

