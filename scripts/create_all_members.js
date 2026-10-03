const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ztjzvdsbrfkcbgakmxcv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0anp2ZHNicmZrY2JnYWtteGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzE2OTYsImV4cCI6MjEwNTIwNzY5Nn0.067XA9kRyw9N8t64o7zzebp6f9T7nBr92PALAhgvLr0';

const membersPath = path.resolve('C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\162aaad5-9dd2-4c5a-be85-93a5eb28f0de\\scratch\\processed_members.json');
const rawData = fs.readFileSync(membersPath, 'utf8');
const membersList = JSON.parse(rawData);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log(`Starting account provisioning for ${membersList.length} members...`);

  const results = [];

  for (let i = 0; i < membersList.length; i++) {
    const m = membersList[i];
    console.log(`\n[${i + 1}/${membersList.length}] Processing ${m.full_name} (${m.email})...`);

    let authUser = null;
    let authStatus = '';

    // 1. Try signIn to see if already registered
    const { data: signInData, error: signInErr } = await createClient(supabaseUrl, supabaseKey).auth.signInWithPassword({
      email: m.email,
      password: m.password,
    });

    if (!signInErr && signInData?.user) {
      authUser = signInData.user;
      authStatus = 'already_exists_verified';
      console.log(`  -> Already exists and authenticated: ${authUser.id}`);
    } else {
      // 2. Sign up
      const { data: signUpData, error: signUpErr } = await createClient(supabaseUrl, supabaseKey).auth.signUp({
        email: m.email,
        password: m.password,
        options: {
          data: {
            full_name: m.full_name,
            phone: m.phone,
            role: 'member',
          },
        },
      });

      if (signUpErr) {
        console.error(`  -> SignUp Error: ${signUpErr.message}`);
        authStatus = `signup_error: ${signUpErr.message}`;
      } else if (signUpData?.user) {
        authUser = signUpData.user;
        authStatus = 'created';
        console.log(`  -> Auth user created: ${authUser.id}`);
      }
    }

    // 3. Ensure member record in public.members
    const client = createClient(supabaseUrl, supabaseKey);
    const { data: existingMember } = await client
      .from('members')
      .select('*')
      .ilike('email', m.email)
      .maybeSingle();

    let dbMember = null;
    let dbStatus = '';

    if (existingMember) {
      const { data: updData, error: updErr } = await client
        .from('members')
        .update({
          membership_no: m.membership_no,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone,
          status: 'active',
          monthly_contribution: m.monthly_contribution,
        })
        .eq('id', existingMember.id)
        .select()
        .single();

      dbMember = updData || existingMember;
      dbStatus = updErr ? `update_error: ${updErr.message}` : 'updated';
      console.log(`  -> Member record updated in DB: ${dbMember.id}`);
    } else {
      const { data: insData, error: insErr } = await client
        .from('members')
        .insert({
          membership_no: m.membership_no,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone,
          email: m.email,
          join_date: m.join_date,
          status: 'active',
          monthly_contribution: m.monthly_contribution,
        })
        .select()
        .single();

      if (insErr) {
        console.error(`  -> Member Insert Error: ${insErr.message}`);
        dbStatus = `insert_error: ${insErr.message}`;
      } else {
        dbMember = insData;
        dbStatus = 'inserted';
        console.log(`  -> Member record inserted into DB: ${dbMember.id}`);
      }
    }

    // 4. Verify login with client
    let verifySuccess = false;
    const { data: verifyData, error: verifyErr } = await createClient(supabaseUrl, supabaseKey).auth.signInWithPassword({
      email: m.email,
      password: m.password,
    });

    if (!verifyErr && verifyData?.user) {
      verifySuccess = true;
      console.log(`  -> Verification login SUCCEEDED!`);
    } else {
      console.warn(`  -> Verification login failed: ${verifyErr?.message}`);
    }

    results.push({
      ...m,
      auth_user_id: authUser?.id || null,
      auth_status: authStatus,
      member_db_id: dbMember?.id || null,
      db_status: dbStatus,
      login_verified: verifySuccess,
    });

    // Rate-limit pause
    await sleep(250);
  }

  const outPath = path.resolve('C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\162aaad5-9dd2-4c5a-be85-93a5eb28f0de\\scratch\\creation_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log(`\n========================================`);
  console.log(`COMPLETED: ${results.filter(r => r.login_verified).length}/${results.length} verified successfully.`);
  console.log(`Results saved to: ${outPath}`);
}

run().catch(console.error);
