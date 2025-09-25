import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Server-side encryption key (generated securely)
const ENCRYPTION_KEY = Deno.env.get('DATA_ENCRYPTION_KEY') || generateSecureKey();

function generateSecureKey(): string {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(key, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const keyBytes = new Uint8Array(32);
  
  // Convert hex key to bytes
  for (let i = 0; i < 32; i++) {
    keyBytes[i] = parseInt(ENCRYPTION_KEY.slice(i * 2, i * 2 + 2), 16);
  }
  
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBytes
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

async function decryptData(encryptedData: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 16);
    const encrypted = combined.slice(16);
    
    const keyBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      keyBytes[i] = parseInt(ENCRYPTION_KEY.slice(i * 2, i * 2 + 2), 16);
    }
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { action, data, encryptedData } = await req.json();

    if (action === 'encrypt') {
      const encrypted = await encryptData(data);
      
      // Audit log
      await supabase.from('tenant_audit_logs').insert({
        user_id: user.id,
        action: 'DATA_ENCRYPTION',
        resource_type: 'secure_data',
        details: { data_type: 'sensitive_field' }
      });

      return new Response(JSON.stringify({ encrypted }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'decrypt') {
      const decrypted = await decryptData(encryptedData);
      
      // Audit log
      await supabase.from('tenant_audit_logs').insert({
        user_id: user.id,
        action: 'DATA_DECRYPTION', 
        resource_type: 'secure_data',
        details: { data_type: 'sensitive_field' }
      });

      return new Response(JSON.stringify({ decrypted }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in secure-data-handler:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});