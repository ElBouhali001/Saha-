
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Camera, 
  Send,
  Calendar,
  Clock,
  User,
  FileText
} from 'lucide-react';
import ChatbaseAI from './ChatbaseAI';

const TeleconsultationModule = () => {
  const CHATBASE_CHATBOT_ID = 'YNi6SyT6KJVAsKXjIXD8P';
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'doctor',
      message: 'Bonjour, comment vous sentez-vous aujourd\'hui ?',
      timestamp: new Date().toLocaleTimeString('fr-FR')
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const scheduledConsultations = [
    {
      id: '1',
      doctor: 'Dr. Kouamé Adjoua',
      specialty: 'Médecine générale',
      date: '2024-01-25',
      time: '14:30',
      status: 'confirmed',
      consultationId: 'TC-2024-001'
    },
    {
      id: '2',
      doctor: 'Dr. Traoré Mamadou',
      specialty: 'Cardiologie',
      date: '2024-01-28',
      time: '10:00',
      status: 'pending',
      consultationId: 'TC-2024-002'
    }
  ];

  const availableDoctors = [
    {
      id: '1',
      name: 'Dr. Kouamé Adjoua',
      specialty: 'Médecine générale',
      status: 'available',
      nextSlot: '14:30'
    },
    {
      id: '2',
      name: 'Dr. Traoré Mamadou',
      specialty: 'Cardiologie',
      status: 'busy',
      nextSlot: '16:00'
    },
    {
      id: '3',
      name: 'Dr. Diallo Fatima',
      specialty: 'Pédiatrie',
      status: 'available',
      nextSlot: '15:15'
    }
  ];

  const handleStartVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCallActive(true);
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const handleEndCall = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCallActive(false);
    setIsVideoOn(true);
    setIsAudioOn(true);
  };

  const toggleVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now().toString(),
        sender: 'patient',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('fr-FR')
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-blue-500" />
            <span>Module de Téléconsultation</span>
          </CardTitle>
          <CardDescription>
            Consultez vos médecins à distance en toute sécurité
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="consultation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consultation">Consultation Active</TabsTrigger>
          <TabsTrigger value="scheduled">Consultations Programmées</TabsTrigger>
          <TabsTrigger value="booking">Réserver</TabsTrigger>
        </TabsList>

        <TabsContent value="consultation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone vidéo */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consultation Vidéo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                    {/* Vidéo du médecin */}
                    <video
                      ref={remoteVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    />
                    
                    {/* Vidéo du patient (en petit) */}
                    <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      {!isVideoOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <VideoOff className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message d'attente */}
                    {!isCallActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                        <div className="text-center text-white">
                          <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">Téléconsultation</p>
                          <p className="text-gray-300">Cliquez sur "Démarrer" pour commencer la consultation</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contrôles */}
                  <div className="flex justify-center space-x-4 mt-4">
                    {!isCallActive ? (
                      <Button onClick={handleStartVideo} className="bg-green-600 hover:bg-green-700">
                        <Video className="w-4 h-4 mr-2" />
                        Démarrer
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={isVideoOn ? "default" : "destructive"}
                          onClick={toggleVideo}
                        >
                          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant={isAudioOn ? "default" : "destructive"}
                          onClick={toggleAudio}
                        >
                          {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleEndCall}
                        >
                          <PhoneOff className="w-4 h-4 mr-2" />
                          Terminer
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assistant IA Chatbase */}
              <ChatbaseAI 
                chatbotId={CHATBASE_CHATBOT_ID}
                className="mt-4"
              />
            </div>

            {/* Chat */}
            <div>
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              msg.sender === 'patient'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Saisie de message */}
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Votre message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultations Programmées</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledConsultations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune téléconsultation programmée</p>
              ) : (
                <div className="space-y-4">
                  {scheduledConsultations.map((consultation) => (
                    <div key={consultation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-blue-500" />
                            <div>
                              <h3 className="font-medium">{consultation.doctor}</h3>
                              <p className="text-sm text-gray-600">{consultation.specialty}</p>
                            </div>
                            <Badge variant={consultation.status === 'confirmed' ? 'default' : 'secondary'}>
                              {consultation.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(consultation.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{consultation.time}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {consultation.consultationId}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Modifier
                          </Button>
                          {consultation.status === 'confirmed' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Video className="w-4 h-4 mr-2" />
                              Rejoindre
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Réserver une Téléconsultation</CardTitle>
              <CardDescription>
                Choisissez un médecin disponible pour une consultation vidéo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableDoctors.map((doctor) => (
                  <div key={doctor.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={doctor.status === 'available' ? 'default' : 'secondary'}>
                              {doctor.status === 'available' ? 'Disponible' : 'Occupé'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Prochain créneau: {doctor.nextSlot}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        disabled={doctor.status !== 'available'}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Réserver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeleconsultationModule;
