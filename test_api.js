const fs = require('fs');
const path = require('path');

const API_BASE = 'http://3.6.21.202:8000/api/v1';
const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjQyN2JkYmQ3YThjZWE0YzlhMGFiOGFjZTZmZTQ5ZmZjNmM0NTJjZjBlYTdhOTRmN2QxNGQ3MTdiOGVkMDJiMjUyOTVhOTc2M2E3NjEwNWUiLCJpYXQiOjE3ODEwOTkyNjcuMzg5NDIyLCJuYmYiOjE3ODEwOTkyNjcuMzg5NDIyLCJleHAiOjIyNTQ0ODQ4NjcuMzgwNzgzLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.CpCjk2hoxsxSJYtkceXCbn07zTRHNSAu0vOXrbQsDL0kHX-wHw-x4jEzWlynz9aL-kD2lDB5qzLiOtDSbbtfH8pcGLw7Smp03FRQbBUDcYwj-EEZSZK3H8Qpa54_tpTe8jXLFw78JCBCpNm0yIgK8Ln988VMWkaxTApe0a7S19zRtNWxw6UEToPJyKTvUWBhTFM2iuTjXT18txmmjTa_LYbQrkgvnlQsrFJSbkiy_YCjl5-vWCSPuh5N7PUNm7C4K5WO2WjHyfLIoIZOpETAqfcpp_NrSQC0GT83u5Kg9MbwkahoKh-HtquDRoxguKfgChS42IShbXHp0VQn4vPHgWhkegNhQ1OP5jptogLaCM7eHMH1B9PMPo_DwE7myWk5uiuArri6x8XyvMzgMQ2jdXWBAmIPXB7X5z0LjoXR7C9K1JFeEkpoYdha7ydlg4uO6lc_MRa9mHYvrmW6SzEjeQsC2M-DPXBMCfEjcK16jNkO756-6G8SqJwrQebhyKwzqa9DU9yWqK3OPKYr4KXu6dAV500B2A-fjxOFUaH-hKN5BuHQQQ-i4aP6--WbeHkH243nEB7A2VLDdpbWIHf4o38_QJ6A0LK9d0GHXrmtJ4s_2dl0cXDsvAPewLBMDAWVXU20Ku5-HJcs86QQsK7oqTAaHilUOx6--Jle0r-r42A';

async function testEndpoint(endpoint) {
  const url = `${API_BASE}/${endpoint}`;
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      }
    });
    console.log(`${endpoint} status:`, res.status);
    if (res.status === 200) {
      const data = await res.json();
      console.log(`${endpoint} total:`, data.total !== undefined ? data.total : (Array.isArray(data) ? data.length : 'object'));
      if (data.rows && data.rows.length > 0) {
        console.log(`${endpoint} first item keys:`, Object.keys(data.rows[0]));
        fs.writeFileSync(path.join(__dirname, `api_${endpoint.replace('/', '_')}.json`), JSON.stringify(data.rows[0], null, 2));
      } else if (Array.isArray(data) && data.length > 0) {
        console.log(`${endpoint} first item keys:`, Object.keys(data[0]));
        fs.writeFileSync(path.join(__dirname, `api_${endpoint.replace('/', '_')}.json`), JSON.stringify(data[0], null, 2));
      } else {
        fs.writeFileSync(path.join(__dirname, `api_${endpoint.replace('/', '_')}.json`), JSON.stringify(data, null, 2));
      }
    } else {
      console.log(`${endpoint} response:`, await res.text());
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
    'locations'
  ];
  for (const ep of endpoints) {
    await testEndpoint(ep);
  }
}

run();
