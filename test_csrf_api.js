const fs = require('fs');
const path = require('path');

const url = 'http://3.6.21.202:8000/api/v1/hardware';
const cookies = JSON.parse(fs.readFileSync(path.join(__dirname, 'cookies.json'), 'utf8'));
const cookieHeader = cookies.cookieHeader;

// Let us fetch the account/api page again to get a fresh CSRF token
async function run() {
  console.log('Fetching account/api to get a fresh CSRF token...');
  const resGet = await fetch('http://3.6.21.202:8000/account/api', {
    headers: { 'Cookie': cookieHeader }
  });
  const html = await resGet.text();
  const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
  if (!csrfMatch) {
    console.error('CSRF token not found');
    return;
  }
  const csrfToken = csrfMatch[1];
  console.log('CSRF Token:', csrfToken);
  
  console.log('Fetching hardware API with session cookie + CSRF token...');
  const res = await fetch(url, {
    headers: {
      'Cookie': cookieHeader,
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json'
    }
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response length:', text.length);
  if (res.status === 200) {
    console.log('SUCCESS! Sample response data:');
    console.log(text.substring(0, 500));
    fs.writeFileSync(path.join(__dirname, 'api_hardware_session.json'), text);
  } else {
    console.log('Failed:', text);
  }
}

run().catch(console.error);
