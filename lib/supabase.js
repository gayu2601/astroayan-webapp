import {
  createClient,
} from '@supabase/supabase-js';



/*
|--------------------------------------------------------------------------
| ENV
|--------------------------------------------------------------------------
*/

const SUPABASE_URL =
  'https://jawtxprffptallfdzhsv.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd3R4cHJmZnB0YWxsZmR6aHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzExNjUsImV4cCI6MjA5NDkwNzE2NX0.GS9yfk39GR23d3kjcVV7ZDkqUdu0dN3JvRwxJuAKod4';


/*
|--------------------------------------------------------------------------
| SAFE WEB STORAGE
|--------------------------------------------------------------------------
*/

const webStorage = {
  getItem: async (key) => {
    if (
      typeof window !== 'undefined'
    ) {
      return localStorage.getItem(key);
    }

    return null;
  },

  setItem: async (key, value) => {
    if (
      typeof window !== 'undefined'
    ) {
      localStorage.setItem(
        key,
        value
      );
    }
  },

  removeItem: async (key) => {
    if (
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem(
        key
      );
    }
  },
};



/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
*/

const storage = webStorage;



/*
|--------------------------------------------------------------------------
| SUPABASE CLIENT
|--------------------------------------------------------------------------
*/

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage,

      autoRefreshToken: true,

      persistSession: true,

      detectSessionInUrl: false,
    },
  }
);