import React from 'react';
import { Card, Typography, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

const CalendarLegend = ({ calendars }) => {
  if (!calendars || calendars.length === 0) {
    return null;
  }

  return (
    <Card 
      size="small" 
      title="Calendar Sources" 
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: '12px' }}
    >
      <div className="calendar-legend">
        {calendars.map(calendar => (
          <Tooltip 
            key={calendar.id} 
            title={
              <>
                <div>URL: {calendar.url}</div>
                {calendar.last_refreshed && (
                  <div>
                    Last refreshed: {moment(calendar.last_refreshed).format('MMM D, YYYY h:mm A')}
                  </div>
                )}
              </>
            }
          >
            <div className="legend-item">
              <div 
                className="color-dot" 
                style={{ backgroundColor: calendar.color }} 
              />
              <Text ellipsis style={{ maxWidth: 150 }}>
                {calendar.name}
              </Text>
              {calendar.last_refreshed && (
                <ClockCircleOutlined 
                  style={{ 
                    fontSize: '12px', 
                    marginLeft: '4px',
                    color: '#8c8c8c'
                  }} 
                />
              )}
            </div>
          </Tooltip>
        ))}
      </div>
    </Card>
  );
};

export default CalendarLegend;
