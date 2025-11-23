import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment-timezone';
import { Spin, Empty } from 'antd';
import EventDetailsModal from './EventDetailsModal';
import AddEventModal from './AddEventModal';

// Setup the localizer for react-big-calendar
// This will use the browser's local timezone automatically
const localizer = momentLocalizer(moment);

// Custom formats for the calendar
const formats = {
  // Show only the title in week and day views instead of the time
  eventTimeRangeFormat: () => '',
  eventTimeRangeStartFormat: () => '',
  eventTimeRangeEndFormat: () => ''
};

const CalendarView = ({ events, calendars, loading, onEventCreated }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addEventModalVisible, setAddEventModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Format events for react-big-calendar
  const formattedEvents = events.map(event => {
    // Find the calendar for this event
    const calendar = calendars.find(cal => cal.id === event.calendar_id);
    
    // Convert UTC dates to local timezone
    const startLocal = moment.utc(event.start_time).local().toDate();
    const endLocal = moment.utc(event.end_time).local().toDate();
    
    return {
      id: event.id,
      title: event.title,
      start: startLocal,
      end: endLocal,
      allDay: event.all_day,
      resource: {
        calendarId: event.calendar_id,
        calendarName: calendar ? calendar.name : 'Calendar',
        description: event.description,
        location: event.location,
        recurrenceRule: event.recurrence_rule,
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

  // Handle event selection
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Handle slot selection (clicking on empty calendar slots)
  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setAddEventModalVisible(true);
  };

  // Handle add event modal close
  const handleCloseAddEventModal = () => {
    setAddEventModalVisible(false);
    setSelectedSlot(null);
  };

  // Handle event creation success
  const handleEventCreated = (newEvent) => {
    // Call the parent's event creation handler
    if (onEventCreated) {
      onEventCreated(newEvent);
    }
    // Close the modal
    handleCloseAddEventModal();
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
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        formats={formats}
        popup
        tooltipAccessor={(event) => `${event.title}${event.resource.location ? `\nLocation: ${event.resource.location}` : ''}`}
        views={['month', 'week', 'day']} // Exclude 'agenda' view
      />
      
      <EventDetailsModal 
        visible={modalVisible}
        event={selectedEvent}
        onClose={handleCloseModal}
      />
      
      <AddEventModal
        visible={addEventModalVisible}
        onClose={handleCloseAddEventModal}
        onEventCreated={handleEventCreated}
        initialDate={selectedSlot?.start}
        initialTime={selectedSlot?.start ? {
          hour: moment(selectedSlot.start).hour(),
          minute: moment(selectedSlot.start).minute()
        } : null}
      />
    </div>
  );
};

export default CalendarView;
