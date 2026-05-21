/**
 * Copy this file to supabase-config.js and fill in your Supabase project values.
 *
 * Supabase Dashboard → Project Settings → API:
 *   - Project URL  → url
 *   - anon public  → anonKey
 *
 * adminWriteKey: pick any long random string, then use the SAME string in
 * supabase/schema.sql (replace REPLACE_WITH_YOUR_ADMIN_WRITE_KEY).
 */
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_ANON_KEY',
  adminWriteKey: 'YOUR_RANDOM_ADMIN_WRITE_KEY',
  storageBucket: 'portfolio-media'
};
