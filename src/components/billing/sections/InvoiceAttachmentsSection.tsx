
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Upload, File, X, Paperclip, Image, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploading?: boolean;
}

interface InvoiceAttachmentsSectionProps {
  attachments: AttachmentFile[];
  onAttachmentsChange: (attachments: AttachmentFile[]) => void;
  coverage: string;
}

const InvoiceAttachmentsSection: React.FC<InvoiceAttachmentsSectionProps> = ({
  attachments,
  onAttachmentsChange,
  coverage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Afficher seulement pour les prises en charge avec transmission automatique
  if (coverage === 'autre') {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: `${file.name} - Seuls les PDF et images sont acceptés`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > maxSize) {
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} - Taille maximale: 10MB`,
          variant: "destructive"
        });
        continue;
      }

      // Ajouter le fichier à la liste avec statut uploading
      const newAttachment: AttachmentFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploading: true
      };

      onAttachmentsChange([...attachments, newAttachment]);

      try {
        setUploading(true);
        
        // Upload vers Supabase Storage
        const filePath = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('invoice-attachments')
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        // Obtenir l'URL du fichier
        const { data: urlData } = supabase.storage
          .from('invoice-attachments')
          .getPublicUrl(filePath);

        // Mettre à jour l'attachement avec l'URL et enlever le statut uploading
        const updatedAttachments = attachments.map(att => 
          att.id === newAttachment.id 
            ? { ...att, url: urlData.publicUrl, uploading: false }
            : att
        );
        updatedAttachments.push({
          ...newAttachment,
          url: urlData.publicUrl,
          uploading: false
        });

        onAttachmentsChange(updatedAttachments.filter(att => att.id !== newAttachment.id || !att.uploading));

        toast({
          title: "Fichier ajouté",
          description: `${file.name} a été ajouté avec succès`
        });

      } catch (error) {
        console.error('Erreur upload:', error);
        
        // Retirer le fichier en cas d'erreur
        onAttachmentsChange(attachments.filter(att => att.id !== newAttachment.id));
        
        toast({
          title: "Erreur d'upload",
          description: `Impossible d'ajouter ${file.name}`,
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
    
    toast({
      title: "Fichier retiré",
      description: "La pièce jointe a été retirée de la transmission"
    });
  };

  const getTransmissionText = () => {
    switch (coverage) {
      case 'mutuelle':
        return 'Ces pièces jointes seront transmises automatiquement avec la facture à la mutuelle';
      case 'tiers-payant':
        return 'Ces pièces jointes seront transmises avec la demande de remboursement à la mutuelle';
      default:
        return '';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Paperclip className="w-5 h-5" />
          <span>Pièces jointes pour transmission</span>
        </CardTitle>
        <CardDescription className="text-blue-700">
          {getTransmissionText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="attachments">Ajouter des pièces jointes (PDF, Images)</Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Upload en cours...' : 'Parcourir'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="text-xs text-gray-600">
              Formats acceptés: PDF, JPG, PNG, GIF (max 10MB)
            </span>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label>Fichiers à transmettre ({attachments.length})</Label>
            <div className="grid gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(attachment.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)}
                        {attachment.uploading && (
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                            Upload...
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    disabled={attachment.uploading}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {coverage === 'mutuelle' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Transmission intégrale:</strong> La facture et toutes les pièces jointes seront envoyées directement à la mutuelle pour traitement.
            </p>
          </div>
        )}

        {coverage === 'tiers-payant' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Transmission partielle:</strong> Après paiement de la part patient, le solde et les pièces jointes seront transmis à la mutuelle.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceAttachmentsSection;
