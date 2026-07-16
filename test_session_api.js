const fs = require('fs');
const path = require('path');

const API_BASE = 'http://3.6.21.202:8000';
const cookies = JSON.parse(fs.readFileSync(path.join(__dirname, 'cookies.json'), 'utf8'));
const cookieHeader = cookies.cookieHeader;

async function testEndpoint(endpoint) {
  const url = `${API_BASE}/${endpoint}`;
  console.log(`Fetching ${url} with session cookie...`);
  try {
    const res = await fetch(url, {
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json'
      }
    });
    console.log(`${endpoint} status:`, res.status);
    const text = await res.text();
    console.log(`${endpoint} response length:`, text.length);
    if (res.status === 200) {
      try {
        const data = JSON.parse(text);
        console.log(`${endpoint} is JSON. Keys:`, Object.keys(data));
        fs.writeFileSync(path.join(__dirname, `session_${endpoint.replace(/[\/\?]/g, '_')}.json`), JSON.stringify(data, null, 2));
      } catch (e) {
        console.log(`${endpoint} is HTML. First 200 chars:`, text.substring(0, 200));
        fs.writeFileSync(path.join(__dirname, `session_${endpoint.replace(/[\/\?]/g, '_')}.html`), text);
      }
    } else {
      console.log(`${endpoint} error response:`, text.substring(0, 200));
    }
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
  }
}

async function run() {
  const endpoints = [
    'hardware',
    'licenses',
    'accessories',
    'consumables',
    'components',
    'users',
    'statuslabels',
    'locations',
    'api/v1/hardware',
    'api/v1/users'
  ];
  for (const ep of endpoints) {
    await testEndpoint(ep);
  }
}

run();
