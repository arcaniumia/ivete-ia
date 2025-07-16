import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://ignqvofyrsdpwjtrzdyr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbnF2b2Z5cnNkcHdqdHJ6ZHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzM2NTUsImV4cCI6MjA2Nzc0OTY1NX0.JWGEN_aMyUA5b7Q4FeG1Dde0o6HPt4fJXVBWZPiL3Ag';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
