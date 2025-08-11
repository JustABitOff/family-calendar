import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import AppHeader from './components/Layout/AppHeader';
import AppSidebar from './components/Layout/AppSidebar';
import CalendarView from './components/Calendar/CalendarView';
import CalendarLegend from './components/Calendar/CalendarLegend';
import { fetchCalendars, fetchEvents, fetchEventsByDateRange } from './services/apiService';

const { Content } = Layout;

function App() {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load calendars on mount
  useEffect(() => {
    loadCalendars();
  }, []);

  // Load events when calendars change
  useEffect(() => {
    if (calendars.length > 0) {
      loadEvents();
    }
  }, [calendars]);

  const loadCalendars = async () => {
    setLoading(true);
    try {
      const data = await fetchCalendars();
      setCalendars(data);
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Calculate date range for a full year (6 months back, 6 months forward)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      
      // Fetch events with the expanded date range
      const data = await fetchEventsByDateRange(startDate, endDate);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCalendars();
      await loadEvents();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCalendarAdded = (newCalendar) => {
    setCalendars([...calendars, newCalendar]);
  };

  const handleCalendarRemoved = (calendarId) => {
    setCalendars(calendars.filter(cal => cal.id !== calendarId));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader 
          toggleSidebar={toggleSidebar} 
          collapsed={sidebarCollapsed}
        />
        <Layout>
          <AppSidebar 
            collapsed={sidebarCollapsed}
            calendars={calendars}
            onCalendarAdded={handleCalendarAdded}
            onCalendarRemoved={handleCalendarRemoved}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
          <Layout style={{ padding: '0 24px 24px' }}>
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                background: '#fff',
                borderRadius: 4,
              }}
            >
              <CalendarLegend calendars={calendars} />
              <CalendarView 
                events={events} 
                calendars={calendars}
                loading={loading}
              />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
