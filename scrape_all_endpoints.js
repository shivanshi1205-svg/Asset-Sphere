const fs = require('fs');
const path = require('path');

const endpoints = {
  hardware: 'api/v1/hardware',
  licenses: 'api/v1/licenses',
  accessories: 'api/v1/accessories',
  consumables: 'api/v1/consumables',
  components: 'api/v1/components',
  users: 'api/v1/users',
  statuslabels: 'api/v1/statuslabels',
  locations: 'api/v1/locations',
  companies: 'api/v1/companies',
  categories: 'api/v1/categories',
  manufacturers: 'api/v1/manufacturers',
  suppliers: 'api/v1/suppliers',
  departments: 'api/v1/departments'
};

async function run() {
  console.log('Logging in to establish session...');
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
  
  console.log('Fetching account/api to set passport cookie and get CSRF token...');
  const apiPageRes = await fetch('http://3.6.21.202:8000/account/api', {
    headers: { 'Cookie': cookieHeader }
  });
  
  const apiPageHtml = await apiPageRes.text();
  const apiPageCookies = apiPageRes.headers.getSetCookie();
  if (apiPageCookies && apiPageCookies.length > 0) {
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
  console.log('Established session successfully!');
  
  const outputDir = path.join(__dirname, 'scraped_data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  for (const [name, relativeUrl] of Object.entries(endpoints)) {
    const url = `http://3.6.21.202:8000/${relativeUrl}`;
    console.log(`Fetching ${name} from ${url}...`);
    try {
      const res = await fetch(url, {
        headers: {
          'Cookie': cookieHeader,
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json'
        }
      });
      console.log(`  Status for ${name}:`, res.status);
      const text = await res.text();
      fs.writeFileSync(path.join(outputDir, `${name}.json`), text);
      if (res.status === 200) {
        try {
          const data = JSON.parse(text);
          console.log(`  Successfully scraped ${name}. Total items: ${data.total}`);
        } catch (e) {
          console.log(`  Fetched ${name} but could not parse as JSON.`);
        }
      } else {
        console.warn(`  Failed to fetch ${name}: ${text.substring(0, 200)}`);
      }
    } catch (err) {
      console.error(`  Error fetching ${name}:`, err.message);
    }
  }
}

run().catch(console.error);
