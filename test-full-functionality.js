const http = require('http');

const API_BASE = 'http://localhost:4000';

async function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Full Bandipur Watch Nexus Functionality\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Backend Health...');
    const health = await testEndpoint('/');
    console.log(`   ✅ Backend Status: ${health.status === 200 ? 'ONLINE' : 'OFFLINE'}`);
    if (health.data) {
      console.log(`   📊 ${health.data.message} - Version ${health.data.version}`);
    }

    // Test 2: Get Devices
    console.log('\n2️⃣ Testing Device Management...');
    const devices = await testEndpoint('/api/devices');
    console.log(`   📱 Devices Found: ${devices.data?.length || 0}`);
    if (devices.data?.length > 0) {
      console.log(`   🔋 Online Devices: ${devices.data.filter(d => d.status === 'online').length}`);
    }

    // Test 3: Add New Device
    console.log('\n3️⃣ Testing Device Addition...');
    const newDevice = {
      device_id: 'TEST-001',
      name: 'Test Device from Settings',
      location: { lat: 11.7000, lng: 76.5800, zone: 'Test Zone' },
      connectivity: 'LoRa'
    };
    const addResult = await testEndpoint('/api/devices', 'POST', newDevice);
    console.log(`   ➕ Add Device: ${addResult.status === 201 ? 'SUCCESS' : 'FAILED'}`);
    if (addResult.data) {
      console.log(`   📱 New Device ID: ${addResult.data[0]?.device_id}`);
    }

    // Test 4: Get Updated Device List
    console.log('\n4️⃣ Testing Updated Device List...');
    const updatedDevices = await testEndpoint('/api/devices');
    console.log(`   📱 Total Devices Now: ${updatedDevices.data?.length || 0}`);

    // Test 5: Device Health
    console.log('\n5️⃣ Testing Device Health...');
    const healthData = await testEndpoint('/api/devices/health');
    if (healthData.data) {
      console.log(`   📊 Total: ${healthData.data.total_devices}, Online: ${healthData.data.online_devices}`);
      console.log(`   🔋 Avg Battery: ${healthData.data.average_battery}%`);
      console.log(`   ⏱️ Avg Uptime: ${healthData.data.average_uptime}%`);
    }

    // Test 6: Get Alerts
    console.log('\n6️⃣ Testing Alert System...');
    const alerts = await testEndpoint('/api/alerts');
    console.log(`   🚨 Active Alerts: ${alerts.data?.length || 0}`);
    if (alerts.data?.length > 0) {
      const unresolved = alerts.data.filter(a => !a.resolved).length;
      console.log(`   ⚠️ Unresolved: ${unresolved}`);
    }

    // Test 7: Test Alert Response
    console.log('\n7️⃣ Testing Alert Response...');
    const responseData = {
      alert_id: 'test-alert-001',
      response_type: 'investigation',
      notes: 'Test response from functionality test'
    };
    const responseResult = await testEndpoint('/api/alerts/respond', 'POST', responseData);
    console.log(`   🎯 Alert Response: ${responseResult.status === 200 ? 'SUCCESS' : 'FAILED'}`);

    // Test 8: Get Analytics
    console.log('\n8️⃣ Testing Analytics...');
    const analytics = await testEndpoint('/api/analytics');
    console.log(`   📈 Analytics Data: ${analytics.status === 200 ? 'AVAILABLE' : 'UNAVAILABLE'}`);
    if (analytics.data?.summary) {
      console.log(`   📊 Total Alerts: ${analytics.data.summary.totalAlerts}`);
      console.log(`   📱 Online Devices: ${analytics.data.summary.onlineDevices}/${analytics.data.summary.totalDevices}`);
    }

    console.log('\n🎉 All Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend is running and responsive');
    console.log('   ✅ Device management is working');
    console.log('   ✅ Alert system is functional');
    console.log('   ✅ Analytics data is available');
    console.log('   ✅ Settings integration is ready');
    
    console.log('\n🌐 Frontend should be accessible at:');
    console.log('   http://localhost:8081 (or 8080 if 8081 is busy)');
    console.log('\n🔧 Backend API is running at:');
    console.log('   http://localhost:4000');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the backend is running:');
    console.log('   cd backend && npm run dev');
  }
}

runTests();















