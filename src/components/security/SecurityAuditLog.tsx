import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Eye, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  created_at: string;
  details: any;
  ip_address?: unknown;
  user_agent?: string;
}

const SecurityAuditLog: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const fetchAuditLogs = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenant_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DATA_ENCRYPTION':
      case 'DATA_DECRYPTION':
        return <Shield className="w-4 h-4" />;
      case 'ACCESS':
        return <Eye className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DATA_ENCRYPTION':
        return 'bg-green-100 text-green-800';
      case 'DATA_DECRYPTION':
        return 'bg-blue-100 text-blue-800';
      case 'ACCESS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card className="border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-orange-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Authentification requise pour voir les journaux d'audit
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-primary">
            <Shield className="w-5 h-5 mr-2" />
            Journal d'Audit Sécurité
          </CardTitle>
          <Button
            onClick={fetchAuditLogs}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Chargement des journaux d'audit...
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Aucun événement d'audit enregistré
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <Badge variant="outline">
                      {log.resource_type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </div>
                  {log.details && (
                    <div className="text-xs text-muted-foreground">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                  {log.ip_address && (
                    <div className="text-xs text-muted-foreground mt-1">
                      IP: {String(log.ip_address)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;