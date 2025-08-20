import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '@/contexts/AppointmentContext';

interface PlanningViewProps {
  viewMode: 'day' | 'week' | 'month';
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  appointments: Appointment[];
  timeSlots: string[];
  getSlotStatus: (time: string, date?: string, doctorId?: string) => string;
  handleTimeSlotClick: (time: string, date?: string, doctorId?: string, event?: React.MouseEvent) => void;
  getWeekDates: (date: string) => string[];
  getMonthDates: (date: string) => string[];
  formatDateHeader: (date: string) => { day: string; date: number; isToday: boolean };
  blockedSlots: any[];
  selectedDoctorForBlocking: string;
}

const PlanningView: React.FC<PlanningViewProps> = ({
  viewMode,
  selectedDate,
  setSelectedDate,
  appointments,
  timeSlots,
  getSlotStatus,
  handleTimeSlotClick,
  getWeekDates,
  getMonthDates,
  formatDateHeader,
  blockedSlots,
  selectedDoctorForBlocking
}) => {
  // Navigation functions
  const navigatePrevious = () => {
    const currentDate = new Date(selectedDate);
    let newDate: Date;

    switch (viewMode) {
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case 'week':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      default:
        return;
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const navigateNext = () => {
    const currentDate = new Date(selectedDate);
    let newDate: Date;

    switch (viewMode) {
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        return;
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const renderNavigationButtons = () => (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={navigatePrevious}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={navigateNext}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
  const renderDayView = () => {
    const today = new Date().toISOString().split('T')[0];
    const isPastDate = selectedDate < today;
    
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Planning du {new Date(selectedDate).toLocaleDateString('fr-FR')}
              {isPastDate && <span className="ml-2 text-sm text-gray-500">(Date passée)</span>}
            </span>
            <div className="flex items-center gap-3">
              {renderNavigationButtons()}
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Astuce :</strong> Cliquez sur un créneau libre (vert) pour créer directement un rendez-vous à cette heure.
              <br />
              🔒 Maintenez <kbd className="px-2 py-1 bg-white border rounded text-xs mx-1">Ctrl</kbd> + clic pour bloquer/débloquer des créneaux.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => {
              const status = getSlotStatus(time, selectedDate, selectedDoctorForBlocking);
              const appointment = appointments.find(apt => 
                apt.date === selectedDate && apt.time === time
              );
              
              return (
                <div
                  key={time}
                  onClick={isPastDate ? undefined : (e) => handleTimeSlotClick(time, selectedDate, undefined, e)}
                  className={`p-3 rounded-lg border text-center text-sm transition-all ${
                    isPastDate 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : status === 'available' 
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer hover:scale-105'
                      : status === 'blocked'
                      ? 'bg-orange-50 border-orange-200 text-orange-700 cursor-pointer hover:bg-orange-100'
                      : 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium flex items-center justify-center gap-1">
                    {time}
                    {status === 'blocked' && <span>🔒</span>}
                  </div>
                  {isPastDate ? (
                    <div className="text-xs mt-1 text-gray-400">
                      Date passée
                    </div>
                  ) : appointment ? (
                    <div className="text-xs mt-1 truncate">
                      {appointment.patientName}
                    </div>
                  ) : status === 'available' ? (
                    <div className="text-xs mt-1 text-green-600 opacity-75">
                      Cliquer pour réserver
                    </div>
                  ) : status === 'blocked' ? (
                    <div className="text-xs mt-1 text-orange-600 opacity-75">
                      Créneau bloqué
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Semaine du {new Date(weekDates[0]).toLocaleDateString('fr-FR')} au {new Date(weekDates[6]).toLocaleDateString('fr-FR')}
            </span>
            <div className="flex items-center gap-3">
              {renderNavigationButtons()}
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-[800px]">
              {/* Header row */}
              <div className="p-2 font-medium text-center text-gray-600">Heure</div>
              {weekDates.map((date) => {
                const { day, date: dayNum, isToday } = formatDateHeader(date);
                const isPastDate = date < today;
                return (
                  <div
                    key={date}
                    className={`p-2 text-center font-medium ${
                      isPastDate
                        ? 'bg-gray-100 text-gray-400'
                        : isToday 
                        ? 'bg-blue-100 text-blue-700 rounded' 
                        : 'text-gray-600'
                    }`}
                  >
                    <div className="text-xs">{day}</div>
                    <div className="text-sm">{dayNum}</div>
                  </div>
                );
              })}
              
              {/* Time slots */}
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="p-2 text-xs text-gray-500 text-center font-medium">
                    {time}
                  </div>
                  {weekDates.map((date) => {
                    const status = getSlotStatus(time, date, selectedDoctorForBlocking);
                    const appointment = appointments.find(apt => 
                      apt.date === date && apt.time === time
                    );
                    const isPastDate = date < today;
                    
                    return (
                      <div
                        key={`${date}-${time}`}
                        onClick={isPastDate ? undefined : (e) => handleTimeSlotClick(time, date, undefined, e)}
                        className={`p-1 text-xs border rounded transition-all ${
                          isPastDate
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : status === 'available' 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                            : status === 'blocked'
                            ? 'bg-orange-50 border-orange-200 hover:bg-orange-100 cursor-pointer'
                            : 'bg-red-50 border-red-200 cursor-not-allowed'
                        }`}
                      >
                        {isPastDate ? (
                          <div className="text-center text-gray-400">-</div>
                        ) : appointment ? (
                          <div className="truncate text-center">
                            {appointment.patientName}
                          </div>
                        ) : status === 'blocked' ? (
                          <div className="text-center text-orange-600">🔒</div>
                        ) : null}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(selectedDate);
    const currentDate = new Date(selectedDate);
    const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {monthName}
            </span>
            <div className="flex items-center gap-3">
              {renderNavigationButtons()}
              <Input
                type="month"
                value={selectedDate.substring(0, 7)}
                onChange={(e) => setSelectedDate(e.target.value + '-01')}
                className="w-40"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Days of week header */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar grid */}
            {monthDates.slice(0, 35).map((date) => {
              const dateObj = new Date(date);
              const isCurrentMonth = dateObj.getMonth() === currentDate.getMonth();
              const isToday = date === today;
              const isPastDate = date < today;
              const dayAppointments = appointments.filter(apt => apt.date === date);
              
              return (
                <div
                  key={date}
                  onClick={isPastDate ? undefined : () => setSelectedDate(date)}
                  className={`min-h-[80px] p-1 border rounded transition-all ${
                    isPastDate
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                      : isCurrentMonth 
                      ? 'bg-white hover:bg-gray-50 cursor-pointer' 
                      : 'bg-gray-50 text-gray-400 cursor-pointer'
                  } ${
                    isToday ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isPastDate 
                      ? 'text-gray-400'
                      : isToday 
                      ? 'text-blue-600' 
                      : isCurrentMonth 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    {dateObj.getDate()}
                  </div>
                  <div className="space-y-1">
                    {!isPastDate && dayAppointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate"
                      >
                        {apt.time} {apt.patientName}
                      </div>
                    ))}
                    {!isPastDate && dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayAppointments.length - 2} autres
                      </div>
                    )}
                    {isPastDate && dayAppointments.length > 0 && (
                      <div className="text-xs text-gray-400">
                        {dayAppointments.length} RDV
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  switch (viewMode) {
    case 'week':
      return renderWeekView();
    case 'month':
      return renderMonthView();
    default:
      return renderDayView();
  }
};

export default PlanningView;