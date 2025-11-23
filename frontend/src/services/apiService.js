import axios from 'axios';
import moment from 'moment';
import 'moment-timezone';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // Always use localhost when running in a browser
  // This is because the browser can't resolve Docker container names
  return 'http://localhost:8042/api';
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Calendar API functions
export const fetchCalendars = async () => {
  try {
    const response = await api.get('/calendars');
    return response.data;
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw error;
  }
};

export const addCalendar = async (calendarData) => {
  try {
    const response = await api.post('/calendars', calendarData);
    return response.data;
  } catch (error) {
    console.error('Error adding calendar:', error);
    throw error;
  }
};

export const deleteCalendar = async (calendarId) => {
  try {
    await api.delete(`/calendars/${calendarId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting calendar ${calendarId}:`, error);
    throw error;
  }
};

export const updateCalendar = async (calendarId, updateData) => {
  try {
    const response = await api.patch(`/calendars/${calendarId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating calendar ${calendarId}:`, error);
    throw error;
  }
};

export const refreshCalendar = async (calendarId) => {
  try {
    const response = await api.post(`/calendars/${calendarId}/refresh`);
    return response.data;
  } catch (error) {
    console.error(`Error refreshing calendar ${calendarId}:`, error);
    throw error;
  }
};

export const refreshAllCalendars = async () => {
  try {
    const response = await api.post('/calendars/refresh-all');
    return response.data;
  } catch (error) {
    console.error('Error refreshing all calendars:', error);
    throw error;
  }
};

// Event API functions
export const fetchEvents = async (params = {}) => {
  try {
    const response = await api.get('/events', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchEventsByCalendar = async (calendarId) => {
  try {
    const response = await api.get('/events', { 
      params: { calendar_id: calendarId } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for calendar ${calendarId}:`, error);
    throw error;
  }
};

export const fetchEventsByDateRange = async (startDate, endDate) => {
  try {
    // Convert dates to ISO strings with the browser's local timezone information
    const startIso = moment(startDate).format();
    const endIso = moment(endDate).format();
    
    const response = await api.get('/events', { 
      params: { 
        start_date: startIso,
        end_date: endIso
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    throw error;
  }
};

// Event creation, updating, and deletion
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await api.delete(`/events/${eventId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};

// Local calendar management
export const getOrCreateLocalCalendar = async () => {
  try {
    const response = await api.get('/calendars/local/default');
    return response.data;
  } catch (error) {
    console.error('Error getting/creating local calendar:', error);
    throw error;
  }
};

// Health check
export const checkApiHealth = async () => {
  try {
    // Use the same base URL logic as the api instance
    const baseUrl = getBaseUrl().replace('/api', '');
    const response = await axios.get(`${baseUrl}/health`);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

