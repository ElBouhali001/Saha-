
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getRestrictedMessage } from '@/utils/permissions';

interface RestrictedDataMessageProps {
  title?: string;
  className?: string;
}

const RestrictedDataMessage: React.FC<RestrictedDataMessageProps> = ({ 
  title = "Accès Restreint", 
  className = "" 
}) => {
  const { user } = useSupabaseAuth();
  
  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-orange-900 mb-1">{title}</h3>
            <p className="text-sm text-orange-700">
              {getRestrictedMessage(user?.user_metadata?.role || '')}
            </p>
            <div className="flex items-center mt-2 text-xs text-orange-600">
              <Shield className="w-3 h-3 mr-1" />
              <span>Données protégées par le secret médical</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestrictedDataMessage;
