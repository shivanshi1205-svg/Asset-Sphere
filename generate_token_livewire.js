const fs = require('fs');
const path = require('path');

const cookies = JSON.parse(fs.readFileSync(path.join(__dirname, 'cookies.json'), 'utf8'));
const cookieHeader = cookies.cookieHeader;

async function run() {
  console.log('Fetching account/api page to extract CSRF token and Livewire state...');
  const res = await fetch('http://3.6.21.202:8000/account/api', {
    headers: { 'Cookie': cookieHeader }
  });
  const html = await res.text();
  
  // Extract CSRF token
  const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
  if (!csrfMatch) {
    console.error('CSRF token not found');
    return;
  }
  const csrfToken = csrfMatch[1];
  console.log('CSRF Token:', csrfToken);
  
  // Extract Livewire snapshot
  const snapshotMatch = html.match(/wire:snapshot="([^"]+)"/);
  if (!snapshotMatch) {
    console.error('Livewire snapshot not found');
    return;
  }
  const snapshotStr = snapshotMatch[1].replace(/&quot;/g, '"');
  const snapshot = JSON.parse(snapshotStr);
  console.log('Livewire Snapshot:', snapshot);
  
  // Build Livewire update request
  // Livewire v3 payload structure
  const payload = {
    _token: csrfToken,
    components: [
      {
        snapshot: JSON.stringify(snapshot),
        updates: {
          name: 'react-token'
        },
        calls: [
          {
            path: '',
            method: 'createToken',
            params: [],
            handler: null
          }
        ]
      }
    ]
  };
  
  console.log('Sending Livewire update request to create token...');
  const updateRes = await fetch('http://3.6.21.202:8000/livewire/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
      'X-CSRF-TOKEN': csrfToken
    },
    body: JSON.stringify(payload)
  });
  
  console.log('Update status:', updateRes.status);
  const updateText = await updateRes.text();
  console.log('Response:', updateText);
  fs.writeFileSync(path.join(__dirname, 'livewire_response.json'), updateText);
}

run().catch(console.error);
