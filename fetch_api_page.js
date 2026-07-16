const fs = require('fs');
const path = require('path');

const url = 'http://3.6.21.202:8000/account/api';
const cookies = JSON.parse(fs.readFileSync(path.join(__dirname, 'cookies.json'), 'utf8'));
const cookieHeader = cookies.cookieHeader;

async function run() {
  console.log(`Fetching ${url} with session cookie...`);
  const res = await fetch(url, {
    headers: {
      'Cookie': cookieHeader
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  fs.writeFileSync(path.join(__dirname, 'account_api.html'), text);
  console.log('Saved account_api.html');
  
  // Find any token or key in the page
  const tokenMatch = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (tokenMatch) {
    console.log('Found pre tag (possible token):', tokenMatch[1].trim());
  } else {
    // print some inputs
    const inputs = [];
    const inputRegex = /<input[^>]*>/g;
    let match;
    while ((match = inputRegex.exec(text)) !== null) {
      inputs.push(match[0]);
    }
    console.log('Input fields found:', inputs);
  }
}

run().catch(console.error);
