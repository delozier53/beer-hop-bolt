import { supabase } from '../lib/supabase';

export async function fetchBreweries() {
  const { data, error } = await supabase.from('breweries').select('*');
  if (error) {
    console.error('Error fetching breweries:', error.message);
    return [];
  }
  return data;
}
