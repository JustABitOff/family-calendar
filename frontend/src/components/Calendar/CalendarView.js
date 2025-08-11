import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Spin, Empty } from 'antd';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const CalendarView = ({ events, calendars, loading }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Format events for react-big-calendar
  const formattedEvents = events.map(event => {
    // Find the calendar for this event
    const calendar = calendars.find(cal => cal.id === event.calendar_id);
    
    return {
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      allDay: event.all_day,
      resource: {
        calendarId: event.calendar_id,
        description: event.description,
        location: event.location,
        color: calendar ? calendar.color : '#1677ff', // Default blue if calendar not found
      }
    };
  });

  // Custom event styling based on calendar color
  const eventStyleGetter = useCallback(
    (event) => {
      const style = {
        backgroundColor: event.resource.color,
        borderRadius: '4px',
        opacity: 0.8,
        color: '#fff',
        border: '0px',
        display: 'block'
      };
      return {
        style
      };
    },
    []
  );

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Handle date change
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading calendar events..." />
      </div>
    );
  }

  if (events.length === 0 && !loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0' }}>
        <Empty 
          description={
            calendars.length === 0 
              ? "Add a calendar to see events" 
              : "No events found in the selected time range"
          } 
        />
      </div>
    );
  }

  return (
    <div style={{ height: 700 }}>
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        popup
        tooltipAccessor={(event) => `${event.title}${event.resource.location ? `\nLocation: ${event.resource.location}` : ''}`}
      />
    </div>
  );
};

export default CalendarView;
