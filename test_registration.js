import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Starting test...");

  // 1. Get an active event
  const { data: events, error: e1 } = await supabase.from('events').select('id').limit(1);
  if (e1 || !events.length) return console.error("No events found", e1);
  const eventId = events[0].id;
  console.log("Using event:", eventId);

  // 2. Get a student user
  const { data: profiles, error: e2 } = await supabase.from('profiles').select('id, email').eq('role', 'student').limit(1);
  if (e2 || !profiles.length) return console.error("No student found", e2);
  const userId = profiles[0].id;
  console.log("Using user:", userId, profiles[0].email);

  // 3. Register for event
  console.log("Registering...");
  // Simulate auth context by running rpc with service key but passing user_id? 
  // No, the RPC uses auth.uid() which is null for service_role unless impersonated.
  // We can write a test RPC or just insert into registrations!
  // Wait, I can't impersonate auth.uid() easily from supabase js. 
  
  // Let's just create a new function in the DB that acts like the RPC but takes a user_id, OR we can test the INSERT logic directly.
  const { data: reg, error: regError } = await supabase.from('registrations')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
      attended: false,
      created_at: new Date().toISOString()
    }, { onConflict: 'event_id, user_id' })
    .select();
    
  console.log("Upsert result:", regError ? regError : reg);
  
  console.log("Cancelling...");
  const { data: canc, error: cancError } = await supabase.from('registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select();
    
  console.log("Cancel result:", cancError ? cancError : canc);
  
  console.log("Re-registering...");
  const { data: reg2, error: reg2Error } = await supabase.from('registrations')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
      attended: false,
      created_at: new Date().toISOString()
    }, { onConflict: 'event_id, user_id' })
    .select();
    
  console.log("Re-register result:", reg2Error ? reg2Error : reg2);
}

test();
