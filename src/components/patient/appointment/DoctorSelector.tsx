import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Loader2 } from 'lucide-react';

interface DoctorSelectorProps {
  doctors: any[];
  selectedDoctor: string;
  onDoctorSelect: (doctorId: string) => void;
  loadingDoctors: boolean;
  getPrimarySpecialty: (doctor: any) => string;
  doctorSpecialties: any[];
}

const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  doctors,
  selectedDoctor,
  onDoctorSelect,
  loadingDoctors,
  getPrimarySpecialty,
  doctorSpecialties
}) => {

  // ✅ Handles both data shapes:
  // - Live backend: doctor.profile.first_name / doctor.profile.last_name
  // - Mock data:    doctor.firstName / doctor.lastName
  const getDoctorName = (doctor: any): string => {
    const firstName = doctor.profile?.first_name || doctor.firstName || '';
    const lastName  = doctor.profile?.last_name  || doctor.lastName  || '';
    return `Dr. ${firstName} ${lastName}`.trim();
  };

  // ✅ Safe fee display — won't crash if consultation_fee is undefined
  const getConsultationFee = (doctor: any): string => {
    const fee = doctor.consultation_fee ?? doctor.consultationFee;
    if (fee === undefined || fee === null) return 'Tarif sur place';
    return `${fee.toLocaleString()} ${doctor.currency || 'FCFA'}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Choisir un médecin</h3>

      {loadingDoctors ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p>Aucun médecin disponible.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedDoctor === doctor.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onDoctorSelect(doctor.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{getDoctorName(doctor)}</h4>
                    <p className="text-sm text-gray-600">{getPrimarySpecialty(doctor)}</p>
                    <p className="text-sm font-medium text-green-600">
                      {getConsultationFee(doctor)}
                    </p>
                  </div>
                </div>
                <Badge variant="default">Disponible</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && doctorSpecialties.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Spécialités du médecin :</h4>
          <div className="flex flex-wrap gap-2">
            {doctorSpecialties.map((specialty: any) => (
              <Badge key={specialty.id} variant="secondary">
                {specialty.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSelector;