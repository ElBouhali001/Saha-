
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FilterModeSelectorProps {
  filterMode: 'specialty' | 'doctor';
  onFilterModeChange: (mode: 'specialty' | 'doctor') => void;
}

const FilterModeSelector: React.FC<FilterModeSelectorProps> = ({
  filterMode,
  onFilterModeChange
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Mode de recherche :</span>
      </div>
      <div className="flex space-x-4">
        <Button
          variant={filterMode === 'specialty' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterModeChange('specialty')}
        >
          Par spécialité
        </Button>
        <Button
          variant={filterMode === 'doctor' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterModeChange('doctor')}
        >
          Par médecin
        </Button>
      </div>
    </div>
  );
};

export default FilterModeSelector;
