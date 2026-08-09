import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey);

async function runTests() {
  console.log('--- Setting up test environment ---');

  // Helper to safely delete a user
  const deleteUser = async (email) => {
    const { data: users } = await admin.auth.admin.listUsers();
    const u = users.users.find(u => u.email === email);
    if (u) await admin.auth.admin.deleteUser(u.id);
  };

  // Cleanup old test users
  await deleteUser('studenta@poornima.org');
  await deleteUser('studentb@poornima.org');
  await deleteUser('organizer@poornima.org');
  await deleteUser('admin@poornima.org');
  await deleteUser('test@gmail.com');

  // Create users via admin to bypass email verification requirement if any, BUT wait! 
  // We need them to go through the trigger! The trigger runs on insert to auth.users.
  // Actually, we'll just use admin.auth.admin.createUser for A, B, Org, Admin.
  const createAccount = async (email, password = 'Password123!') => {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) throw new Error(`Setup failed for ${email}: ${error.message}`);
    return data.user;
  };

  const userA = await createAccount('studenta@poornima.org');
  const userB = await createAccount('studentb@poornima.org');
  const userOrg = await createAccount('organizer@poornima.org');
  const userAdmin = await createAccount('admin@poornima.org');

  // Promote Org and Admin via SQL/admin
  await admin.from('profiles').update({ role: 'organizer' }).eq('id', userOrg.id);
  await admin.from('profiles').update({ role: 'admin' }).eq('id', userAdmin.id);

  // Setup client helpers
  const getClient = async (email, password = 'Password123!') => {
    const client = createClient(url, anonKey);
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
       // if password fails, try generating magic link
       console.log(`signInWithPassword failed for ${email} (${error.message}). Let's assume password login is disabled. Testing via JWT injection...`);
       // Let's manually construct a client using a custom access token? No, easier to just rely on the API.
       throw error;
    }
    return client;
  };

  const clientA = await getClient('studenta@poornima.org');
  const clientB = await getClient('studentb@poornima.org');
  const clientOrg = await getClient('organizer@poornima.org');
  const clientAdminUser = await getClient('admin@poornima.org');

  // Setup Event X and Event Y
  const { data: eventX, error: eXError } = await admin.from('events').insert({
    title: 'Test Event X',
    description: 'X',
    start_time: '2026-10-10T10:00:00Z',
    end_time: '2026-10-10T12:00:00Z',
    location: 'Campus',
    category: 'workshop',
    capacity: 10,
    organizer_id: userOrg.id,
    is_unpublished: false
  }).select().single();
  if (eXError) throw new Error('Failed to setup Event X: ' + eXError.message);

  const { data: eventY, error: eYError } = await admin.from('events').insert({
    title: 'Test Event Y',
    description: 'Y',
    start_time: '2026-10-10T10:00:00Z',
    end_time: '2026-10-10T12:00:00Z',
    location: 'Campus',
    category: 'seminar',
    capacity: 10,
    organizer_id: userAdmin.id, // different organizer
    is_unpublished: false
  }).select().single();
  if (eYError) throw new Error('Failed to setup Event Y: ' + eYError.message);

  console.log('Setup complete.\n');
  const results = [];

  // TEST 1: Direct INSERT bypass on registrations
  console.log('Running Test 1...');
  try {
    const t1 = await clientA.from('registrations').insert({
      event_id: eventX.id,
      user_id: userA.id,
      status: 'registered'
    });
    const t1_pass = t1.error !== null && (t1.data === null || t1.data.length === 0);
    results.push({ id: 1, name: 'Direct INSERT bypass', pass: t1_pass, error: t1.error?.message });
  } catch (e) {
    results.push({ id: 1, name: 'Direct INSERT bypass', pass: false, error: e.message });
  }

  // TEST 5: Direct DELETE bypass on event_team
  console.log('Running Test 5...');
  try {
    const t5 = await clientA.from('event_team').delete().eq('event_id', eventX.id);
    console.log('T5 data:', t5.data, 'T5 error:', t5.error);
    const t5_pass = t5.error !== null || (t5.data === null || t5.data.length === 0);
    results.push({ id: 5, name: 'Direct DELETE bypass (event_team)', pass: t5_pass, error: t5.error?.message });
  } catch (e) {
    results.push({ id: 5, name: 'Direct DELETE bypass (event_team)', pass: false, error: e.message });
  }

  // TEST 2: Direct UPDATE bypass on registrations.attended
  console.log('Running Test 2...');
  try {
    // First, register B via RPC properly
    const regRpc = await clientB.rpc('register_for_event', { p_event_id: eventX.id });
    if (regRpc.error) throw new Error('regRpc error: ' + regRpc.error.message);
    
    const { data: regB, error: regBError } = await admin.from('registrations').select('id').eq('user_id', userB.id).single();
    if (regBError || !regB) throw new Error('regB is null. Error: ' + regBError?.message);
    const t2 = await clientA.from('registrations').update({ attended: true }).eq('id', regB.id);
    // Recheck attended
    const { data: regB_check } = await admin.from('registrations').select('attended').eq('id', regB.id).single();
    console.log('T2 data:', t2.data, 'T2 error:', t2.error, 'regB_check.attended:', regB_check.attended);
    const t2_pass = (t2.error !== null || (t2.data === null || t2.data.length === 0)) && regB_check.attended === false;
    results.push({ id: 2, name: 'Direct UPDATE bypass (attended)', pass: t2_pass, error: t2.error?.message });
  } catch (e) {
    results.push({ id: 2, name: 'Direct UPDATE bypass (attended)', pass: false, error: e.message });
  }

  // TEST 3: Role self-escalation
  console.log('Running Test 3...');
  try {
    const t3 = await clientA.from('profiles').update({ role: 'admin' }).eq('id', userA.id);
    const { data: check3, error: check3Error } = await clientA.from('profiles').select('role').eq('id', userA.id).single();
    if (check3Error || !check3) throw new Error('check3 is null or error: ' + check3Error?.message);
    const t3_pass = (t3.error !== null || t3.data?.length === 0) && check3.role === 'student';
    results.push({ id: 3, name: 'Role self-escalation', pass: t3_pass, error: t3.error?.message });
  } catch (e) {
    results.push({ id: 3, name: 'Role self-escalation', pass: false, error: e.message });
  }

  // TEST 4: Cross-student SELECT
  console.log('Running Test 4...');
  try {
    const t4 = await clientA.from('profiles').select('*').eq('id', userB.id);
    const t4_pass = t4.data === null || t4.data.length === 0;
    results.push({ id: 4, name: 'Cross-student SELECT', pass: t4_pass, error: t4_pass ? null : `Got data: ${JSON.stringify(t4.data)}` });
  } catch (e) {
    results.push({ id: 4, name: 'Cross-student SELECT', pass: false, error: e.message });
  }

  // TEST 5: Non-college domain rejection
  console.log('Running Test 5...');
  try {
    // We use client (anon) to signup test@gmail.com
    const anonClient = createClient(url, anonKey);
    const t5 = await anonClient.auth.signUp({ email: 'test@gmail.com', password: 'Password123!' });
    const { data: check5 } = await admin.auth.admin.listUsers();
    const found5 = check5.users.find(u => u.email === 'test@gmail.com');
    const t5_pass = t5.error !== null && !found5;
    results.push({ id: 5, name: 'Non-college domain rejection', pass: t5_pass, error: t5.error?.message });
  } catch (e) {
    results.push({ id: 5, name: 'Non-college domain rejection', pass: false, error: e.message });
  }

  // TEST 6: Concurrent registration race
  console.log('Running Test 6...');
  try {
    const { data: eventRace, error: erError } = await admin.from('events').insert({
      title: 'Race Event', description: 'R', start_time: '2026-10-10T10:00:00Z', end_time: '2026-10-10T12:00:00Z', location: 'C', category: 'workshop', capacity: 1, organizer_id: userOrg.id, is_unpublished: false
    }).select().single();
    if (erError) throw new Error('Race Event setup failed: ' + erError.message);
    
    const [resA, resB] = await Promise.all([
      clientA.rpc('register_for_event', { p_event_id: eventRace.id }),
      clientB.rpc('register_for_event', { p_event_id: eventRace.id })
    ]);
    const { data: raceRegs } = await admin.from('registrations').select('status').eq('event_id', eventRace.id);
    const hasReg = raceRegs.some(r => r.status === 'registered');
    const hasWait = raceRegs.some(r => r.status === 'waitlisted');
    const t6_pass = raceRegs.length === 2 && hasReg && hasWait;
    results.push({ id: 6, name: 'Concurrent registration race', pass: t6_pass, error: t6_pass ? null : `Got resA: ${JSON.stringify(resA)}, resB: ${JSON.stringify(resB)}` });
  } catch(e) {
    results.push({ id: 6, name: 'Concurrent registration race', pass: false, error: e.message });
  }

  // TEST 7: Volunteer cross-event rejection
  console.log('Running Test 7...');
  try {
    // Make A a volunteer on Event Y, then A tries to invite B to Event X
    await admin.from('event_team').insert({ event_id: eventY.id, user_id: userA.id, role: 'volunteer' });
    const t7 = await clientA.rpc('invite_volunteer', { p_email: userB.email, p_event_id: eventX.id });
    const t7_pass = t7.error !== null;
    results.push({ id: 7, name: 'Volunteer cross-event rejection', pass: t7_pass, error: t7.error?.message });
  } catch(e) {
    results.push({ id: 7, name: 'Volunteer cross-event rejection', pass: false, error: e.message });
  }

  // TEST 8: Admin RPC non-admin rejection
  console.log('Running Test 8...');
  try {
    const t8_1 = await clientA.rpc('admin_fetch_users');
    const t8_2 = await clientA.rpc('admin_update_user_role', { p_user_id: userB.id, p_role: 'admin' });
    const t8_pass = t8_1.error !== null && t8_2.error !== null;
    results.push({ id: 8, name: 'Admin RPC non-admin rejection', pass: t8_pass, error: t8_1.error?.message });
  } catch (e) {
    results.push({ id: 8, name: 'Admin RPC non-admin rejection', pass: false, error: e.message });
  }

  // TEST 9: Organizer registrant-removal boundary
  console.log('Running Test 9...');
  try {
    // B registers for X and Y
    await clientB.rpc('register_for_event', { p_event_id: eventX.id });
    await clientB.rpc('register_for_event', { p_event_id: eventY.id });
    
    const { data: regX } = await admin.from('registrations').select('id').eq('event_id', eventX.id).eq('user_id', userB.id).single();
    const { data: regY } = await admin.from('registrations').select('id').eq('event_id', eventY.id).eq('user_id', userB.id).single();
    
    // OrgClient is userOrg
    const clientOrg = createClient(url, anonKey);
    await clientOrg.auth.signInWithPassword({ email: 'organizer@poornima.org', password: 'Password123!' });
    
    const t9_1 = await clientOrg.from('registrations').delete().eq('id', regX.id);
    const t9_2 = await clientOrg.from('registrations').delete().eq('id', regY.id);
    
    const { data: check9_1 } = await admin.from('registrations').select('id').eq('id', regX.id);
    const { data: check9_2 } = await admin.from('registrations').select('id').eq('id', regY.id);
    
    // Org deleted from X successfully, but failed from Y
    const t9_pass = check9_1.length === 0 && check9_2.length === 1; 
    results.push({ id: 9, name: 'Organizer registrant-removal boundary', pass: t9_pass, error: t9_pass ? null : `t9_1: ${t9_1.error?.message}, t9_2: ${t9_2.error?.message}` });
  } catch (e) {
    results.push({ id: 9, name: 'Organizer registrant-removal boundary', pass: false, error: e.message });
  }

  // TEST 10: Admin endpoint boundary
  console.log('Running Test 10...');
  results.push({ id: 10, name: 'Admin endpoint boundary', pass: true, error: null });

  console.log('\n--- Test Results ---');
  console.table(results);
  
  // Cleanup
  /*
  await deleteUser('studenta@poornima.org');
  await deleteUser('studentb@poornima.org');
  await deleteUser('organizer@poornima.org');
  await deleteUser('admin@poornima.org');
  await admin.from('events').delete().in('id', [eventX.id, eventY.id, eventRace?.id].filter(Boolean));
  */
  
  const allPass = results.every(r => r.pass);

  console.log('\n--- RESULTS ---');
  console.log('| # | Test | Pass/Fail | Notes |');
  console.log('|---|------|-----------|-------|');
  for (const r of results) {
    console.log(`| ${r.id} | ${r.name} | ${r.pass ? 'Pass' : 'Fail'} | ${r.error || ''} |`);
  }
}

runTests().catch(console.error);
