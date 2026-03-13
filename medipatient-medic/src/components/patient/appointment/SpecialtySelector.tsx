
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Loader2 } from 'lucide-react';

interface SpecialtySelectorProps {
  specialties: any[];
  selectedSpecialty: string;
  onSpecialtyChange: (specialtyId: string) => void;
  filteredDoctors: any[];
  selectedDoctor: string;
  onDoctorSelect: (doctorId: string) => void;
  loadingDoctors: boolean;
  getPrimarySpecialty: (doctor: any) => string;
}

const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({
  specialties,
  selectedSpecialty,
  onSpecialtyChange,
  filteredDoctors,
  selectedDoctor,
  onDoctorSelect,
  loadingDoctors,
  getPrimarySpecialty
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Choisir une spécialité</h3>
      <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une spécialité" />
        </SelectTrigger>
        <SelectContent>
          {specialties.map((specialty) => (
            <SelectItem key={specialty.id} value={specialty.id}>
              {specialty.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSpecialty && (
        <>
          <h4 className="font-medium">Médecins disponibles</h4>
          {loadingDoctors ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoctors.map((doctor) => (
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
                        <h4 className="font-medium">
                          Dr. {doctor.profile?.first_name} {doctor.profile?.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{getPrimarySpecialty(doctor)}</p>
                        <p className="text-sm font-medium text-green-600">
                          {doctor.consultation_fee.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">
                      Disponible
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpecialtySelector;
