process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');

// Manually parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const schema = await res.json();
    console.log("Paths:");
    if (schema.paths) {
      Object.keys(schema.paths).forEach(p => {
        if (p.startsWith('/rpc/')) {
          console.log(` - ${p}`);
        }
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
