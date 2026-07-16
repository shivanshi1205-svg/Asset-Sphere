const fs = require('fs');
const path = require('path');

const url = 'http://3.6.21.202:8000/api/v1/hardware';

async function run() {
  // 1. Perform login
  console.log('Logging in...');
  const loginUrl = 'http://3.6.21.202:8000/login';
  const getRes = await fetch(loginUrl);
  const getHtml = await getRes.text();
  let getCookies = getRes.headers.getSetCookie();
  let cookieHeader = getCookies.map(c => c.split(';')[0]).join('; ');
  
  const tokenMatch = getHtml.match(/name="_token"\s+value="([^"]+)"/);
  const token = tokenMatch[1];
  
  const params = new URLSearchParams();
  params.append('_token', token);
  params.append('username', 'demo');
  params.append('password', '87654321');
  
  const postRes = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieHeader,
    },
    body: params.toString(),
    redirect: 'manual'
  });
  
  let postCookies = postRes.headers.getSetCookie();
  if (postCookies && postCookies.length > 0) {
    cookieHeader = postCookies.map(c => c.split(';')[0]).join('; ');
  }
  
  // 2. Fetch account/api page to trigger geomind_passport_token cookie setting and get CSRF token
  console.log('Fetching account/api...');
  const apiPageRes = await fetch('http://3.6.21.202:8000/account/api', {
    headers: { 'Cookie': cookieHeader }
  });
  
  const apiPageHtml = await apiPageRes.text();
  const apiPageCookies = apiPageRes.headers.getSetCookie();
  if (apiPageCookies && apiPageCookies.length > 0) {
    // Merge new cookies into cookieHeader
    const cookieMap = {};
    cookieHeader.split('; ').forEach(c => {
      const parts = c.split('=');
      cookieMap[parts[0]] = parts.slice(1).join('=');
    });
    apiPageCookies.forEach(c => {
      const parts = c.split(';')[0].split('=');
      cookieMap[parts[0]] = parts.slice(1).join('=');
    });
    cookieHeader = Object.keys(cookieMap).map(k => `${k}=${cookieMap[k]}`).join('; ');
  }
  
  const csrfMatch = apiPageHtml.match(/name="csrf-token"\s+content="([^"]+)"/);
  const csrfToken = csrfMatch[1];
  console.log('CSRF Token:', csrfToken);
  console.log('Cookie Header:', cookieHeader);
  
  // 3. Request the API using cookieHeader and X-CSRF-TOKEN
  console.log('Requesting API...');
  const apiRes = await fetch(url, {
    headers: {
      'Cookie': cookieHeader,
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json'
    }
  });
  
  console.log('API Status:', apiRes.status);
  const apiText = await apiRes.text();
  console.log('API Response length:', apiText.length);
  if (apiRes.status === 200) {
    console.log('SUCCESS! Sample:');
    console.log(apiText.substring(0, 500));
    fs.writeFileSync(path.join(__dirname, 'api_hardware_cookie.json'), apiText);
  } else {
    console.log('Failed:', apiText);
  }
}

run().catch(console.error);
