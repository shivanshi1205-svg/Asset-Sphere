const fs = require('fs');
const path = require('path');

const url = 'http://3.6.21.202:8000/api/v1/hardware';
const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjQyN2JkYmQ3YThjZWE0YzlhMGFiOGFjZTZmZTQ5ZmZjNmM0NTJjZjBlYTdhOTRmN2QxNGQ3MTdiOGVkMDJiMjUyOTVhOTc2M2E3NjEwNWUiLCJpYXQiOjE3ODEwOTkyNjcuMzg5NDIyLCJuYmYiOjE3ODEwOTkyNjcuMzg5NDIyLCJleHAiOjIyNTQ0ODQ4NjcuMzgwNzgzLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.CpCjk2hoxsxSJYtkceXCbn07zTRHNSAu0vOXrbQsDL0kHX-wHw-x4jEzWlynz9aL-kD2lDB5qzLiOtDSbbtfH8pcGLw7Smp03FRQbBUDcYwj-EEZSZK3H8Qpa54_tpTe8jXLFw78JCBCpNm0yIgK8Ln988VMWkaxTApe0a7S19zRtNWxw6UEToPJyKTvUWBhTFM2iuTjXT18txmmjTa_LYbQrkgvnlQsrFJSbkiy_YCjl5-vWCSPuh5N7PUNm7C4K5WO2WjHyfLIoIZOpETAqfcpp_NrSQC0GT83u5Kg9MbwkahoKh-HtquDRoxguKfgChS42IShbXHp0VQn4vPHgWhkegNhQ1OP5jptogLaCM7eHMH1B9PMPo_DwE7myWk5uiuArri6x8XyvMzgMQ2jdXWBAmIPXB7X5z0LjoXR7C9K1JFeEkpoYdha7ydlg4uO6lc_MRa9mHYvrmW6SzEjeQsC2M-DPXBMCfEjcK16jNkO756-6G8SqJwrQebhyKwzqa9DU9yWqK3OPKYr4KXu6dAV500B2A-fjxOFUaH-hKN5BuHQQQ-i4aP6--WbeHkH243nEB7A2VLDdpbWIHf4o38_QJ6A0LK9d0GHXrmtJ4s_2dl0cXDsvAPewLBMDAWVXU20Ku5-HJcs86QQsK7oqTAaHilUOx6--Jle0r-r42A';

async function run() {
  console.log('Fetching', url);
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json'
    }
  });
  console.log('Status:', res.status);
  console.log('Status Text:', res.statusText);
  console.log('Headers:');
  for (const [k, v] of res.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
  const body = await res.text();
  console.log('Body:', body);
}

run().catch(console.error);
