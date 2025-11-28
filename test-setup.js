#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing Bandipur Watch Nexus Setup...\n');

// Test backend health
function testBackend() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:4000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'healthy') {
            console.log('✅ Backend is running and healthy');
            console.log(`   Message: ${response.message}`);
            console.log(`   Version: ${response.version}`);
            resolve(true);
          } else {
            console.log('❌ Backend health check failed');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Backend returned invalid JSON');
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Backend is not running');
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Backend connection timeout');
      resolve(false);
    });
  });
}

// Test API endpoints
async function testAPI() {
  const endpoints = [
    { name: 'Devices', url: 'http://localhost:4000/api/devices' },
    { name: 'Alerts', url: 'http://localhost:4000/api/alerts' },
    { name: 'Analytics', url: 'http://localhost:4000/api/analytics' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name} API working (${Array.isArray(data) ? data.length : 'data'} items)`);
      } else {
        console.log(`❌ ${endpoint.name} API failed (${response.status})`);
      }
    } catch (err) {
      console.log(`❌ ${endpoint.name} API error: ${err.message}`);
    }
  }
}

// Test frontend
function testFrontend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8080', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend is running');
        resolve(true);
      } else {
        console.log(`❌ Frontend returned status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Frontend is not running');
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Frontend connection timeout');
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('Testing Backend...');
  const backendOk = await testBackend();
  
  if (backendOk) {
    console.log('\nTesting API Endpoints...');
    await testAPI();
  }
  
  console.log('\nTesting Frontend...');
  const frontendOk = await testFrontend();
  
  console.log('\n📋 Setup Summary:');
  console.log(`Backend: ${backendOk ? '✅ Running' : '❌ Not running'}`);
  console.log(`Frontend: ${frontendOk ? '✅ Running' : '❌ Not running'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 Setup is complete! Your Bandipur Watch Nexus is ready to use.');
    console.log('   Frontend: http://localhost:8080');
    console.log('   Backend:  http://localhost:4000');
  } else {
    console.log('\n⚠️  Some services are not running. Please check the setup instructions in SETUP.md');
  }
}

runTests().catch(console.error);

