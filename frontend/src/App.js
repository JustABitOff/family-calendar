import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme, Button, Space } from 'antd';
import { CalendarOutlined, UnorderedListOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment-timezone';

import AppHeader from './components/Layout/AppHeader';
import AppSidebar from './components/Layout/AppSidebar';
import CalendarView from './components/Calendar/CalendarView';
import AgendaView from './components/Calendar/AgendaView';
import CalendarLegend from './components/Calendar/CalendarLegend';
import { fetchCalendars, fetchEvents, fetchEventsByDateRange } from './services/apiService';

const { Content } = Layout;

function App() {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar' or 'agenda'

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
      // Use moment.js with browser's local timezone
      const startDate = moment().subtract(6, 'months').toDate();
      const endDate = moment().add(6, 'months').toDate();
      
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
              {/* View Navigation Controls */}
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Button
                    type={currentView === 'calendar' ? 'primary' : 'default'}
                    icon={<CalendarOutlined />}
                    onClick={() => setCurrentView('calendar')}
                  >
                    Calendar
                  </Button>
                  <Button
                    type={currentView === 'agenda' ? 'primary' : 'default'}
                    icon={<UnorderedListOutlined />}
                    onClick={() => setCurrentView('agenda')}
                  >
                    Agenda
                  </Button>
                </Space>
              </div>

              {/* Calendar Legend - only show for calendar view */}
              {currentView === 'calendar' && <CalendarLegend calendars={calendars} />}
              
              {/* Conditional View Rendering */}
              {currentView === 'calendar' ? (
                <CalendarView 
                  events={events} 
                  calendars={calendars}
                  loading={loading}
                />
              ) : (
                <AgendaView 
                  events={events} 
                  calendars={calendars}
                  loading={loading}
                  onDateRangeChange={() => {}} // Independent operation - no need to sync with calendar
                />
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
