import React from 'react';
import { Modal, Typography, Space, Descriptions, Tag } from 'antd';
import moment from 'moment';
import 'moment-timezone';

const EventDetailsModal = ({ visible, event, onClose }) => {
  if (!event) return null;

  const formatDateTime = (date, allDay) => {
    // Convert UTC date to local timezone
    const localDate = moment.utc(date).local();
    
    return allDay 
      ? localDate.format('LL') // Format as date only
      : localDate.format('LLL'); // Format as date and time
  };

  const getDuration = () => {
    // Convert UTC dates to local timezone
    const start = moment.utc(event.start).local();
    const end = moment.utc(event.end).local();
    
    if (event.allDay) {
      // For all-day events, calculate days
      const days = end.diff(start, 'days');
      return days <= 1 ? 'All day' : `${days} days`;
    } else {
      // For time-specific events
      const duration = moment.duration(end.diff(start));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      
      if (hours === 0) {
        return `${minutes} minutes`;
      } else if (minutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    }
  };

  return (
    <Modal
      title="Event Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4} style={{ 
            color: event.resource?.color || '#1677ff',
            marginBottom: 8
          }}>
            {event.title}
          </Typography.Title>
          
          {event.resource?.description && (
            <Typography.Paragraph>
              <div dangerouslySetInnerHTML={{ __html: event.resource.description }} />
            </Typography.Paragraph>
          )}
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="When">
            {event.allDay ? (
              <>
                {formatDateTime(event.start, event.allDay)}
                {moment(event.end).diff(moment(event.start), 'days') > 1 && (
                  <> to {formatDateTime(event.end, event.allDay)}</>
                )}
                <Tag color="blue" style={{ marginLeft: 8 }}>All day</Tag>
              </>
            ) : (
              <>
                {formatDateTime(event.start, event.allDay)} to {formatDateTime(event.end, event.allDay)}
              </>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="Duration">
            {getDuration()}
          </Descriptions.Item>
          
          {event.resource?.location && (
            <Descriptions.Item label="Location">
              {event.resource.location}
            </Descriptions.Item>
          )}
          
          {event.resource?.calendarId && (
            <Descriptions.Item label="Calendar">
              <Tag color={event.resource.color || '#1677ff'}>
                {event.resource.calendarName || 'Calendar'}
              </Tag>
            </Descriptions.Item>
          )}
          
          {event.resource?.recurrenceRule && (
            <Descriptions.Item label="Repeats">
              {event.resource.recurrenceRule}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Space>
    </Modal>
  );
};

export default EventDetailsModal;
