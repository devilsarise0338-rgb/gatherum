import { supabase } from './supabase';
import * as XLSX from 'xlsx';
import { Registration, Profile, Event } from '../types';

export async function exportEventParticipants(eventId: string, eventTitle: string, currentUserId: string) {
  try {
    // 1. Verify Authorization
    // We fetch the event explicitly to ensure the user is the organizer.
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      throw new Error('Event not found or unauthorized.');
    }

    // Technically we could allow team members here too if event_team table existed.
    // For now, only the primary organizer is checked.
    if (eventData.organizer_id !== currentUserId) {
      throw new Error('You are not authorized to export data for this event.');
    }

    // 2. Fetch Data
    // Join registrations with profiles to get student details
    const { data: regs, error: regsError } = await supabase
      .from('registrations')
      .select(`
        *,
        profile:student_id (
          full_name,
          roll_number,
          branch,
          email,
          phone_number
        )
      `)
      .eq('event_id', eventId);

    if (regsError) throw new Error('Failed to fetch participants: ' + regsError.message);

    // 3. Filter Data
    const presentRows = [];
    const waitlistedRows = [];

    // Safely cast the joined profile since Supabase returns it as an array or object
    const getProfile = (r: any): Partial<Profile> => r.profile || {};

    let presentIdx = 1;
    let waitlistIdx = 1;

    for (const r of (regs || [])) {
      const p = getProfile(r);
      
      // Present Students
      if (r.status === 'attended' || r.attended === true) {
        presentRows.push({
          'Sr. No.': presentIdx++,
          'Student Name': p.full_name || 'Unknown',
          'Roll Number': p.roll_number || 'N/A',
          'Branch': p.branch || 'N/A',
          'Email': p.email || r.student_email || 'N/A',
          'Phone': p.phone_number || 'N/A',
          'Registration Status': 'Registered',
          'Attendance Status': 'Present',
          'Check-in Time': new Date(r.created_at).toLocaleString() // Note: No check_in_time field exists, fallback to created_at
        });
      }
      
      // Waitlisted Students
      else if (r.status === 'waitlisted') {
        waitlistedRows.push({
          'Sr. No.': waitlistIdx++,
          'Student Name': p.full_name || 'Unknown',
          'Roll Number': p.roll_number || 'N/A',
          'Branch': p.branch || 'N/A',
          'Email': p.email || r.student_email || 'N/A',
          'Phone': p.phone_number || 'N/A',
          'Registration Status': 'Waitlisted',
          'Waitlisted At': new Date(r.created_at).toLocaleString()
        });
      }
    }

    // Ensure we have at least one row with headers if empty
    if (presentRows.length === 0) {
      presentRows.push({
        'Sr. No.': 'No students present',
        'Student Name': '',
        'Roll Number': '',
        'Branch': '',
        'Email': '',
        'Phone': '',
        'Registration Status': '',
        'Attendance Status': '',
        'Check-in Time': ''
      });
    }

    if (waitlistedRows.length === 0) {
      waitlistedRows.push({
        'Sr. No.': 'No students waitlisted',
        'Student Name': '',
        'Roll Number': '',
        'Branch': '',
        'Email': '',
        'Phone': '',
        'Registration Status': '',
        'Waitlisted At': ''
      });
    }

    // 4. Generate Worksheets
    const wb = XLSX.utils.book_new();
    const wsPresent = XLSX.utils.json_to_sheet(presentRows);
    const wsWaitlisted = XLSX.utils.json_to_sheet(waitlistedRows);

    // Auto-size columns (rough approximation)
    const cols = [
      { wch: 8 },  // Sr No
      { wch: 25 }, // Name
      { wch: 15 }, // Roll No
      { wch: 15 }, // Branch
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Reg Status
      { wch: 20 }, // Att/Wait Status
      { wch: 25 }  // Time
    ];
    wsPresent['!cols'] = cols;
    wsWaitlisted['!cols'] = cols;

    // Append to workbook
    XLSX.utils.book_append_sheet(wb, wsPresent, 'Present Students');
    XLSX.utils.book_append_sheet(wb, wsWaitlisted, 'Waitlisted Students');

    // 5. Generate and Download
    const safeTitle = eventTitle.replace(/[\/\\:*?"<>|]/g, '').trim().replace(/\s+/g, '_');
    const filename = `Gatherum_${safeTitle}_Participants.xlsx`;

    XLSX.writeFile(wb, filename);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}
