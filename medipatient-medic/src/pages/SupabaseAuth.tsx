
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthComponent from '@/components/auth/AuthComponent';
import MainLayout from '@/components/layout/MainLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

const SupabaseAuth = () => {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent />;
  }

  return <MainLayout />;
};

export default SupabaseAuth;
