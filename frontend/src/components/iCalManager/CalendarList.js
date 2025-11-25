import React, { useState } from 'react';
import { List, Button, Popconfirm, Typography, Tooltip, message, Popover } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { deleteCalendar, refreshCalendar, updateCalendar } from '../../services/apiService';
import moment from 'moment';

const { Text } = Typography;

// Predefined colors for calendars - same as in AddCalendarForm
const CALENDAR_COLORS = [
  '#1677ff', // Blue
  '#52c41a', // Green
  '#fa8c16', // Orange
  '#f5222d', // Red
  '#722ed1', // Purple
  '#eb2f96', // Pink
  '#faad14', // Yellow
  '#13c2c2', // Cyan
  '#2f54eb', // Geekblue
  '#fa541c', // Volcano
];

const CalendarList = ({ calendars, onCalendarRemoved, onCalendarAdded }) => {
  const [refreshingIds, setRefreshingIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [updatingIds, setUpdatingIds] = useState([]);

  if (!calendars || calendars.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Text type="secondary">No calendars added yet</Text>
      </div>
    );
  }

  const handleRefresh = async (calendar) => {
    setRefreshingIds(prev => [...prev, calendar.id]);
    try {
      await refreshCalendar(calendar.id);
      message.success(`Calendar "${calendar.name}" refreshed successfully`);
    } catch (error) {
      message.error(`Failed to refresh calendar "${calendar.name}"`);
      console.error('Error refreshing calendar:', error);
    } finally {
      setRefreshingIds(prev => prev.filter(id => id !== calendar.id));
    }
  };

  const handleDelete = async (calendar) => {
    setDeletingIds(prev => [...prev, calendar.id]);
    try {
      await deleteCalendar(calendar.id);
      message.success(`Calendar "${calendar.name}" removed successfully`);
      if (onCalendarRemoved) {
        onCalendarRemoved(calendar.id);
      }
    } catch (error) {
      message.error(`Failed to remove calendar "${calendar.name}"`);
      console.error('Error removing calendar:', error);
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== calendar.id));
    }
  };

  const handleColorChange = async (calendar, newColor) => {
    if (calendar.color === newColor) {
      return; // No change needed
    }
    
    setUpdatingIds(prev => [...prev, calendar.id]);
    try {
      await updateCalendar(calendar.id, { color: newColor });
      message.success(`Calendar color updated successfully`);
      
      // Force a page refresh to show the updated color
      window.location.reload();
    } catch (error) {
      message.error(`Failed to update calendar color`);
      console.error('Error updating calendar color:', error);
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== calendar.id));
    }
  };

  // Color picker content
  const renderColorPicker = (calendar) => (
    <div className="color-picker">
      <div style={{ marginBottom: '8px' }}>Select a color:</div>
      <div className="color-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {CALENDAR_COLORS.map(color => (
          <div
            key={color}
            className="color-option"
            style={{
              backgroundColor: color,
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              cursor: 'pointer',
              border: calendar.color === color ? '2px solid #000' : '1px solid #d9d9d9'
            }}
            onClick={() => handleColorChange(calendar, color)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <List
      size="small"
      dataSource={calendars}
      renderItem={calendar => (
        <List.Item
          key={calendar.id}
          actions={[
            <Tooltip title="Refresh Calendar" key="refresh">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                type="text"
                loading={refreshingIds.includes(calendar.id)}
                onClick={() => handleRefresh(calendar)}
              />
            </Tooltip>,
            <Tooltip title="Remove Calendar" key="delete">
              <Popconfirm
                title="Remove this calendar?"
                description="All events from this calendar will be removed."
                onConfirm={() => handleDelete(calendar)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  type="text"
                  danger
                  loading={deletingIds.includes(calendar.id)}
                />
              </Popconfirm>
            </Tooltip>
          ]}
        >
          <List.Item.Meta
            avatar={
              <Popover 
                content={renderColorPicker(calendar)} 
                title="Change Calendar Color"
                trigger="click"
              >
                <div 
                  className="color-dot" 
                  style={{ 
                    backgroundColor: calendar.color,
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }} 
                />
              </Popover>
            }
            title={calendar.name}
            description={
              <Text type="secondary" ellipsis style={{ fontSize: '12px' }}>
                {calendar.last_refreshed 
                  ? `Last updated: ${moment(calendar.last_refreshed).fromNow()}`
                  : 'Not yet refreshed'}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default CalendarList;
