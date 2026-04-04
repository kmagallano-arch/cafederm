#!/usr/bin/env node

/**
 * CafeDerm — Supabase setup check
 *
 * Checks whether the `products` table exists. If not, prints instructions
 * for creating it via the Supabase SQL Editor.
 *
 * Usage:  node scripts/setup-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SUPABASE_URL = 'https://qogblzkpzreeikygwjhf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ2JsemtwenJlZWlreWd3amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNDUwMTcsImV4cCI6MjA5MDkyMTAxN30.fw_xvn2Fl0h-_w8UlrZ28eYXR8R6lZsZwTN8hUgfOw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Checking if the products table exists...\n');

  const { data, error } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (error) {
    if (
      error.message.includes('does not exist') ||
      error.message.includes('relation') ||
      error.code === '42P01'
    ) {
      console.log('The "products" table does NOT exist yet.\n');
      console.log('To create it:');
      console.log(
        '  1. Open the Supabase SQL Editor:',
        'https://supabase.com/dashboard/project/qogblzkpzreeikygwjhf/sql'
      );

      const __dirname = dirname(fileURLToPath(import.meta.url));
      const sqlPath = join(__dirname, 'create-table.sql');
      console.log(`  2. Paste the contents of ${sqlPath}`);
      console.log('  3. Click "Run"\n');
      console.log('After creating the table, run:');
      console.log('  node scripts/seed-products.mjs\n');
    } else {
      console.error('Unexpected error:', error.message);
    }
    process.exit(1);
  }

  console.log('The "products" table exists.');
  console.log(`Found ${data.length} row(s) in a quick check.`);
  console.log(
    '\nTo seed products, run:  node scripts/seed-products.mjs\n'
  );
}

main();
