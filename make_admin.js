const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.qwyabndajfhpnrgzgrge:zuCmyd-zercaw-cunju0@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  try {
    const res = await client.query("SELECT id FROM auth.users WHERE email = 'compton248@gmail.com'");
    if (res.rows.length > 0) {
      const realId = res.rows[0].id;
      console.log("Found real ID:", realId);
      await client.query("INSERT INTO public.global_admins (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [realId]);
      console.log("Successfully made global admin!");
    } else {
      console.log("User not found in auth.users!");
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
