import React from 'react';
import { Modal, Typography, Space, Descriptions, Tag } from 'antd';
import moment from 'moment';
import 'moment-timezone';

const EventDetailsModal = ({ visible, event, onClose }) => {
  if (!event) return null;

  const formatDateTime = (date, allDay) => {
    const localDate = moment.utc(date).local();
    return allDay 
      ? localDate.format('LL') 
      : localDate.format('LLL');
  };

  const getDuration = () => {
    const start = moment.utc(event.start).local();
    const end = moment.utc(event.end).local();
    
    if (event.allDay) {
      const days = end.diff(start, 'days');
      return days <= 1 ? 'All day' : `${days} days`;
    } else {
      const duration = moment.duration(end.diff(start));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      
      if (hours === 0) return `${minutes} minutes`;
      if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const hasContent = value => {
    if (typeof value !== 'string') return Boolean(value);
    return value.replace(/[\s\u00A0]+/g, '').length > 0;
  };

  const rows = [
    {
      label: 'When',
      content: event.allDay ? (
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
      )
    },
    { label: 'Duration', content: getDuration() },
    { label: 'Location', content: event.resource?.location },
    {
      label: 'Calendar',
      content: event.resource?.calendarId && event.resource?.calendarName ? (
        <Tag color={event.resource.color || '#1677ff'}>
          {event.resource.calendarName}
        </Tag>
      ) : null
    },
    { label: 'Repeats', content: event.resource?.recurrenceRule }
  ];

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
          <Typography.Title
            level={4}
            style={{
              color: event.resource?.color || '#1677ff',
              marginBottom: 8
            }}
          >
            {event.title}
          </Typography.Title>

          {hasContent(event.resource?.description) && (
            <Typography.Paragraph>
              <div dangerouslySetInnerHTML={{ __html: event.resource.description }} />
            </Typography.Paragraph>
          )}
        </div>

        <Descriptions bordered column={1} size="small">
          {rows
            .filter(row => hasContent(row.content))
            .map((row, idx) => (
              <Descriptions.Item key={idx} label={row.label}>
                {row.content}
              </Descriptions.Item>
            ))}
        </Descriptions>
      </Space>
    </Modal>
  );
};

export default EventDetailsModal;