const fs = require('fs');
const path = require('path');

async function run() {
  const cookiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'cookies.json'), 'utf8'));
  let cookieHeader = cookiesData.cookieHeader;
  
  console.log('Fetching account/api...');
  const res = await fetch('http://3.6.21.202:8000/account/api', {
    headers: {
      'Cookie': cookieHeader,
      'Accept': 'text/html'
    }
  });
  
  console.log('GET status:', res.status);
  const getCookies = res.headers.getSetCookie();
  if (getCookies && getCookies.length > 0) {
    cookieHeader = getCookies.map(c => c.split(';')[0]).join('; ');
    console.log('Updated cookies from GET:', cookieHeader);
  }
  
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
  console.log('Livewire Memo ID:', snapshot.memo.id);
  
  // Build Livewire update request
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
            params: ['react-token'],
            handler: null
          }
        ]
      }
    ]
  };
  
  console.log('Sending Livewire update to generate token...');
  const updateRes = await fetch('http://3.6.21.202:8000/livewire/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  console.log('Update status:', updateRes.status);
  const updateCookies = updateRes.headers.getSetCookie();
  console.log('Cookies after POST:', updateCookies);
  
  const updateText = await updateRes.text();
  console.log('Response body:', updateText.substring(0, 1000));
  fs.writeFileSync(path.join(__dirname, 'livewire_response_fixed.json'), updateText);
}

run().catch(console.error);
