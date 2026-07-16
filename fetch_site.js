const fs = require('fs');
const path = require('path');

async function run() {
  const loginUrl = 'http://3.6.21.202:8000/login';
  
  console.log('Fetching login page to get CSRF token and cookie...');
  const getRes = await fetch(loginUrl);
  const getHtml = await getRes.text();
  const getCookies = getRes.headers.getSetCookie();
  
  // Extract CSRF token
  const tokenMatch = getHtml.match(/name="_token"\s+value="([^"]+)"/);
  if (!tokenMatch) {
    console.error('Could not find CSRF token in login page');
    return;
  }
  const token = tokenMatch[1];
  console.log('Found CSRF token:', token);
  console.log('Initial Cookies:', getCookies);
  
  // Format cookie header
  let cookieHeader = getCookies.map(c => c.split(';')[0]).join('; ');
  
  // Perform POST login
  console.log('Sending login POST request...');
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
    redirect: 'manual' // We want to inspect the redirect response
  });
  
  console.log('Login response status:', postRes.status);
  const postCookies = postRes.headers.getSetCookie();
  console.log('Post Login Cookies:', postCookies);
  
  if (postCookies && postCookies.length > 0) {
    cookieHeader = postCookies.map(c => c.split(';')[0]).join('; ');
  }
  
  // Let's follow redirect if it redirects
  const redirectUrl = postRes.headers.get('location');
  console.log('Redirecting to:', redirectUrl);
  
  if (redirectUrl) {
    const dashboardRes = await fetch(redirectUrl, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    console.log('Dashboard status:', dashboardRes.status);
    const dashboardHtml = await dashboardRes.text();
    fs.writeFileSync(path.join(__dirname, 'dashboard.html'), dashboardHtml);
    console.log('Saved dashboard.html');
    
    // Find all links in the dashboard
    const links = [];
    const linkRegex = /href="([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(dashboardHtml)) !== null) {
      const href = match[1];
      if (href.startsWith('http://3.6.21.202:8000') || href.startsWith('/')) {
        if (!links.includes(href)) {
          links.push(href);
        }
      }
    }
    console.log('Found links in dashboard:', links);
    
    // Save cookies to use in other fetches
    fs.writeFileSync(path.join(__dirname, 'cookies.json'), JSON.stringify({ cookieHeader }));
  }
}

run().catch(console.error);
