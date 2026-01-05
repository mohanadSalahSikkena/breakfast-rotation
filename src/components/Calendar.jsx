import React, { useState } from 'react';

const Calendar = ({ history, rotationType = 'breakfast' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const config = {
    breakfast: {
      title: 'Breakfast Calendar',
      emptyMessage: 'No breakfast purchases this month',
      color: '#667eea'
    },
    orders: {
      title: 'Orders Collection Calendar',
      emptyMessage: 'No orders collections this month',
      color: '#28a745'
    }
  };

  const { title, emptyMessage, color } = config[rotationType];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getHistoryForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return history.filter(item => {
      const itemDate = item.date;
      return itemDate.getFullYear() === year &&
             itemDate.getMonth() === month &&
             itemDate.getDate() === day;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>{title}</h2>
        <div className="calendar-controls">
          <button className="btn btn-secondary btn-small" onClick={previousMonth}>
            ← Prev
          </button>
          <button className="btn btn-primary btn-small" onClick={goToToday}>
            Today
          </button>
          <button className="btn btn-secondary btn-small" onClick={nextMonth}>
            Next →
          </button>
        </div>
      </div>

      <div className="calendar-month-year">
        {monthNames[month]} {year}
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day calendar-day-empty" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayHistory = getHistoryForDate(day);
          const isToday = isCurrentMonth && today.getDate() === day;
          const hasEvents = dayHistory.length > 0;

          return (
            <div
              key={day}
              className={`calendar-day ${isToday ? 'calendar-day-today' : ''} ${hasEvents ? 'calendar-day-has-events' : ''}`}
            >
              <div className="calendar-day-number">{day}</div>
              {hasEvents && (
                <div className="calendar-day-events">
                  {dayHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="calendar-event"
                      style={{ borderLeftColor: color }}
                      title={`${item.employeeName} - ${item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    >
                      <div className="calendar-event-name">{item.employeeName}</div>
                      <div className="calendar-event-time">
                        {item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {history.length === 0 && (
        <div className="calendar-empty-state">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Calendar;
