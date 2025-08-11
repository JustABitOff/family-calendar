import axios from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // In development with Docker, use the backend service name
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_IN_DOCKER === 'true') {
    return 'http://backend:8000/api';
  }
  // In development without Docker, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api';
  }
  // In production, use relative URL (assuming API is served from same domain)
  return '/api';
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
    const response = await api.get('/events', { 
      params: { 
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events by date range:', error);
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
