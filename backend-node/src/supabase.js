import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[WARN] Supabase credentials missing. Image uploads will fail.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export const uploadToSupabase = async (buffer, filename, contentType, bucket = 'lost-and-found') => {
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase not configured');

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${Date.now()}-${filename}`, buffer, {
      contentType,
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};
