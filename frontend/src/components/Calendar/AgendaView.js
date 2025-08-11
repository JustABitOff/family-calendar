import React, { useState, useEffect } from 'react';
import { Table, Select, DatePicker, Space, Button, Card, Tag, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment-timezone';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const AgendaView = ({ events, calendars, loading, onDateRangeChange }) => {
  const [filterType, setFilterType] = useState('thisMonth');
  const [customDateRange, setCustomDateRange] = useState([null, null]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Calculate date ranges based on filter type
  const getDateRange = (type) => {
    const now = moment();
    
    switch (type) {
      case 'today':
        return [moment().startOf('day'), moment().endOf('day')];
      case 'thisWeek':
        return [moment().startOf('week'), moment().endOf('week')];
      case 'thisMonth':
        return [moment().startOf('month'), moment().endOf('month')];
      case 'custom':
        return customDateRange;
      default:
        return [now.startOf('month'), now.endOf('month')];
    }
  };

  // Apply date range filter
  useEffect(() => {
    const [startDate, endDate] = getDateRange(filterType);
    
    if (startDate && endDate) {
      // Notify parent component about date range change
      onDateRangeChange(startDate.toDate(), endDate.toDate());
    }
  }, [filterType, customDateRange, onDateRangeChange]);

  // Filter events based on current date range
  useEffect(() => {
    const [startDate, endDate] = getDateRange(filterType);
    
    if (startDate && endDate) {
      const filtered = events.filter(event => {
        const eventStart = moment.utc(event.start_time).local();
        const eventEnd = moment.utc(event.end_time).local();
        
        // Event overlaps with the selected date range
        // Check if event starts before or on end date AND ends after or on start date
        return eventStart.isSameOrBefore(endDate, 'day') && 
               eventEnd.isSameOrAfter(startDate, 'day');
      });
      
      // Sort by start time
      filtered.sort((a, b) => moment.utc(a.start_time).diff(moment.utc(b.start_time)));
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [events, filterType, customDateRange]);

  const handleFilterChange = (value) => {
    setFilterType(value);
    if (value !== 'custom') {
      setCustomDateRange([null, null]);
    }
  };

  const handleCustomDateChange = (dates) => {
    setCustomDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      setFilterType('custom');
    }
  };

  const resetToThisMonth = () => {
    setFilterType('thisMonth');
    setCustomDateRange([null, null]);
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Date & Time',
      key: 'datetime',
      width: 200,
      render: (_, record) => {
        const startTime = moment(record.start_time);
        const endTime = moment(record.end_time);
        const isAllDay = record.all_day;
        
        return (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {startTime.format('MMM DD, YYYY')}
            </div>
            {!isAllDay && (
              <div style={{ color: '#666', fontSize: '12px' }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
              </div>
            )}
            {isAllDay && (
              <div style={{ color: '#666', fontSize: '12px' }}>
                <Tag color="blue" size="small">All Day</Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Event',
      key: 'event',
      render: (_, record) => {
        const calendar = calendars.find(cal => cal.id === record.calendar_id);
        
        return (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {record.title}
            </div>
            <div style={{ marginBottom: 4 }}>
              <Tag 
                color={calendar?.color || '#1677ff'} 
                style={{ 
                  color: '#fff',
                  border: 'none'
                }}
              >
                {calendar?.name || 'Unknown Calendar'}
              </Tag>
            </div>
            {record.location && (
              <div style={{ color: '#666', fontSize: '12px' }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {record.location}
              </div>
            )}
            {record.description && (
              <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                {record.description.length > 100 
                  ? `${record.description.substring(0, 100)}...` 
                  : record.description
                }
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const [startDate, endDate] = getDateRange(filterType);
  const dateRangeText = startDate && endDate 
    ? `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`
    : '';

  return (
    <Card 
      title="Event Agenda" 
      style={{ marginTop: 16 }}
      extra={
        <Space>
          <Select
            value={filterType}
            onChange={handleFilterChange}
            style={{ width: 120 }}
          >
            <Option value="today">Today</Option>
            <Option value="thisWeek">This Week</Option>
            <Option value="thisMonth">This Month</Option>
            <Option value="custom">Custom</Option>
          </Select>
          
          {filterType === 'custom' && (
            <RangePicker
              value={customDateRange}
              onChange={handleCustomDateChange}
              format="MMM DD, YYYY"
            />
          )}
          
          {filterType !== 'thisMonth' && (
            <Button onClick={resetToThisMonth} size="small">
              Reset to This Month
            </Button>
          )}
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Showing {filteredEvents.length} events for {dateRangeText}
        </Text>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredEvents}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} events`,
        }}
        locale={{
          emptyText: 'No events found for the selected date range'
        }}
      />
    </Card>
  );
};

export default AgendaView;
