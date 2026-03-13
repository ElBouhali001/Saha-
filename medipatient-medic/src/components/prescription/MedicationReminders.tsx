import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Clock, 
  CheckCircle,
  Volume2,
  Loader2,
  Calendar,
  Pill
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  start_date: string;
  end_date: string | null;
  last_taken_at: string | null;
  next_reminder_at: string | null;
  active: boolean;
  language: string;
}

const MedicationReminders = ({ patientId }: { patientId: string }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
    
    // Check for reminders every minute
    const interval = setInterval(checkReminders, 60000);
    
    return () => clearInterval(interval);
  }, [patientId]);

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('medication_reminders' as any)
        .select('*')
        .eq('patient_id', patientId)
        .eq('active', true)
        .order('next_reminder_at', { ascending: true });

      if (error) throw error;
      setReminders((data as any) || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const checkReminders = async () => {
    const now = new Date();
    
    for (const reminder of reminders) {
      if (!reminder.next_reminder_at) continue;
      
      const reminderTime = new Date(reminder.next_reminder_at);
      const diff = reminderTime.getTime() - now.getTime();
      
      // Trigger notification if within 1 minute
      if (diff > 0 && diff < 60000) {
        showNotification(reminder);
        if (voiceEnabled) {
          speakReminder(reminder);
        }
      }
    }
  };

  const showNotification = async (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('💊 Rappel de médicament', {
        body: `Il est temps de prendre ${reminder.medication_name} - ${reminder.dosage}`,
        icon: '/pill-icon.png',
        tag: reminder.id
      });
    }

    toast({
      title: "💊 Rappel de médicament",
      description: `${reminder.medication_name} - ${reminder.dosage}`,
      duration: 10000,
    });
  };

  const speakReminder = async (reminder: Reminder) => {
    try {
      // Use ElevenLabs voice if available
      const text = `Il est temps de prendre votre médicament: ${reminder.medication_name}, dosage ${reminder.dosage}`;
      
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-key');
      
      if (!error && data?.apiKey) {
        // Use ElevenLabs for high-quality voice
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'xi-api-key': data.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
        }
      } else {
        // Fallback to browser speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = reminder.language || 'fr-FR';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error speaking reminder:', error);
    }
  };

  const markAsTaken = async (reminderId: string) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      // Log the intake
      await supabase.from('medication_intake_log' as any).insert({
        reminder_id: reminderId,
        patient_id: patientId,
        taken_at: now,
        scheduled_time: now,
        status: 'taken'
      });

      // Update reminder
      await supabase
        .from('medication_reminders' as any)
        .update({
          last_taken_at: now
        })
        .eq('id', reminderId);

      toast({
        title: "✅ Prise confirmée",
        description: "Le médicament a été enregistré",
      });

      await loadReminders();
    } catch (error) {
      console.error('Error marking as taken:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la prise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "🔔 Notifications activées",
          description: "Vous recevrez des rappels pour vos médicaments",
        });
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const getNextDoseTime = (reminder: Reminder) => {
    if (!reminder.next_reminder_at) return 'Non programmé';
    
    const time = new Date(reminder.next_reminder_at);
    const now = new Date();
    const diff = time.getTime() - now.getTime();
    
    if (diff < 0) return 'En retard';
    if (diff < 3600000) return `Dans ${Math.round(diff / 60000)} min`;
    if (diff < 86400000) return `Aujourd'hui à ${time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    
    return time.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
              <span>Rappels de Médicaments</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Switch
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun rappel actif</p>
            <p className="text-sm">Démarrez un traitement pour activer les rappels</p>
          </CardContent>
        </Card>
      ) : (
        reminders.map((reminder) => (
          <Card key={reminder.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Pill className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{reminder.medication_name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                  <p className="text-sm text-muted-foreground">{reminder.frequency}</p>
                </div>
                <Badge variant="outline">
                  {reminder.active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* Next dose */}
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prochaine prise:</span>
                    <span className="text-sm font-medium">{getNextDoseTime(reminder)}</span>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Treatment period */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Début: {new Date(reminder.start_date).toLocaleDateString('fr-FR')}</span>
                </div>
                {reminder.end_date && (
                  <span>Fin: {new Date(reminder.end_date).toLocaleDateString('fr-FR')}</span>
                )}
              </div>

              {/* Last taken */}
              {reminder.last_taken_at && (
                <p className="text-xs text-muted-foreground">
                  Dernière prise: {new Date(reminder.last_taken_at).toLocaleString('fr-FR')}
                </p>
              )}

              {/* Action button */}
              <Button
                onClick={() => markAsTaken(reminder.id)}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                J'ai pris ce médicament
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MedicationReminders;
