import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Clock } from 'lucide-react';
import { Appointment } from '@/contexts/AppointmentContext';

interface PlanningViewProps {
  viewMode: 'day' | 'week' | 'month';
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  appointments: Appointment[];
  timeSlots: string[];
  getSlotStatus: (time: string, date?: string) => string;
  handleTimeSlotClick: (time: string, date?: string) => void;
  getWeekDates: (date: string) => string[];
  getMonthDates: (date: string) => string[];
  formatDateHeader: (date: string) => { day: string; date: number; isToday: boolean };
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
  formatDateHeader
}) => {
  const renderDayView = () => (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Planning du {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Astuce :</strong> Cliquez sur un créneau libre (vert) pour créer directement un rendez-vous à cette heure.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((time) => {
            const status = getSlotStatus(time);
            const appointment = appointments.find(apt => 
              apt.date === selectedDate && apt.time === time
            );
            
            return (
              <div
                key={time}
                onClick={() => handleTimeSlotClick(time)}
                className={`p-3 rounded-lg border text-center text-sm transition-all ${
                  status === 'available' 
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer hover:scale-105'
                    : 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                }`}
              >
                <div className="font-medium">{time}</div>
                {appointment ? (
                  <div className="text-xs mt-1 truncate">
                    {appointment.patientName}
                  </div>
                ) : status === 'available' && (
                  <div className="text-xs mt-1 text-green-600 opacity-75">
                    Cliquer pour réserver
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Semaine du {new Date(weekDates[0]).toLocaleDateString('fr-FR')} au {new Date(weekDates[6]).toLocaleDateString('fr-FR')}
            </span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-[800px]">
              {/* Header row */}
              <div className="p-2 font-medium text-center text-gray-600">Heure</div>
              {weekDates.map((date) => {
                const { day, date: dayNum, isToday } = formatDateHeader(date);
                return (
                  <div
                    key={date}
                    className={`p-2 text-center font-medium ${
                      isToday ? 'bg-blue-100 text-blue-700 rounded' : 'text-gray-600'
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
                    const status = getSlotStatus(time, date);
                    const appointment = appointments.find(apt => 
                      apt.date === date && apt.time === time
                    );
                    
                    return (
                      <div
                        key={`${date}-${time}`}
                        onClick={() => handleTimeSlotClick(time, date)}
                        className={`p-1 text-xs border rounded cursor-pointer transition-all ${
                          status === 'available' 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 border-red-200 cursor-not-allowed'
                        }`}
                      >
                        {appointment && (
                          <div className="truncate text-center">
                            {appointment.patientName}
                          </div>
                        )}
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
    
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {monthName}
            </span>
            <Input
              type="month"
              value={selectedDate.substring(0, 7)}
              onChange={(e) => setSelectedDate(e.target.value + '-01')}
              className="w-40"
            />
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
              const isToday = date === new Date().toISOString().split('T')[0];
              const dayAppointments = appointments.filter(apt => apt.date === date);
              
              return (
                <div
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[80px] p-1 border rounded cursor-pointer transition-all ${
                    isCurrentMonth 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 text-gray-400'
                  } ${
                    isToday ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {dateObj.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate"
                      >
                        {apt.time} {apt.patientName}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayAppointments.length - 2} autres
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