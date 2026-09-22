import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db', 'data_store.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

async function clearData() {
  console.log('🧹 Starting database and file storage wipe...\n');

  // 1. Reset local JSON database
  const emptyData = {
    teams: [],
    team_members: [],
    payments: [],
    ppt_submissions: [],
    announcements: [],
    admin_logs: []
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(emptyData, null, 2), 'utf-8');
    console.log('✅ Local data_store.json reset to empty state.');
  } catch (err) {
    console.error('❌ Failed to clear data_store.json:', err.message);
  }

  // 2. Clear all uploaded files in uploads/
  if (fs.existsSync(UPLOAD_DIR)) {
    try {
      const files = fs.readdirSync(UPLOAD_DIR);
      let count = 0;
      for (const file of files) {
        if (file === '.gitkeep') continue;
        const filePath = path.join(UPLOAD_DIR, file);
        fs.unlinkSync(filePath);
        count++;
      }
      console.log(`✅ Cleared ${count} uploaded file(s) from uploads/ directory.`);
    } catch (err) {
      console.error('❌ Failed to clear uploads directory:', err.message);
    }
  }

  // 3. Clear Supabase Remote Database if configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey);
      console.log('📡 Connecting to Supabase to clear remote database tables...');

      await supabase.from('ppt_submissions').delete().not('id', 'is', null);
      await supabase.from('payments').delete().not('id', 'is', null);
      await supabase.from('team_members').delete().not('id', 'is', null);
      await supabase.from('teams').delete().not('id', 'is', null);
      await supabase.from('announcements').delete().not('id', 'is', null);
      await supabase.from('audit_logs').delete().not('id', 'is', null);

      console.log('✅ Supabase remote database tables cleared successfully.');
    } catch (err) {
      console.error('⚠️ Supabase remote clear error (non-fatal):', err.message);
    }
  }

  console.log('\n✨ Database & storage wipe complete! All submitted teams, payments, PPTs, and uploaded files are cleared.');
}

clearData();
