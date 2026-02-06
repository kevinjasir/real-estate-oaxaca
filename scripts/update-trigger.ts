import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTrigger() {
  console.log("Updating handle_new_user trigger...");

  const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  user_count INTEGER;
  new_role user_role;
  is_active BOOLEAN;
  user_full_name TEXT;
  user_avatar TEXT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  IF user_count = 0 THEN
    new_role := 'super_admin';
    is_active := true;
  ELSE
    new_role := 'client';
    is_active := true;
  END IF;
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(COALESCE(NEW.email, 'user@example.com'), '@', 1)
  );
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  INSERT INTO public.users (id, email, full_name, avatar_url, role, active)
  VALUES (NEW.id, COALESCE(NEW.email, 'unknown@example.com'), user_full_name, user_avatar, new_role, is_active)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$func$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.log("RPC not available, trigger update needs to be done via Supabase Dashboard.");
    console.log("Please copy this SQL and run it in Supabase SQL Editor:");
    console.log(sql);
  } else {
    console.log("Trigger updated successfully!");
  }
}

updateTrigger();
