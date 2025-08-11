import React, { useState } from 'react';
import { List, Button, Popconfirm, Typography, Tooltip, message } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { deleteCalendar, refreshCalendar } from '../../services/apiService';
import moment from 'moment';

const { Text } = Typography;

const CalendarList = ({ calendars, onCalendarRemoved }) => {
  const [refreshingIds, setRefreshingIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);

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
              <div 
                className="color-dot" 
                style={{ 
                  backgroundColor: calendar.color,
                  width: '16px',
                  height: '16px'
                }} 
              />
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
