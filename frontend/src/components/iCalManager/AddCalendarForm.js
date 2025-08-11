import React, { useState } from 'react';
import { Form, Input, Button, message, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { addCalendar } from '../../services/apiService';

// Predefined colors for calendars
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

const AddCalendarForm = ({ onCalendarAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Assign a random color if not provided
      if (!values.color) {
        values.color = CALENDAR_COLORS[Math.floor(Math.random() * CALENDAR_COLORS.length)];
      }
      
      const newCalendar = await addCalendar(values);
      message.success(`Calendar "${values.name}" added successfully`);
      form.resetFields();
      
      if (onCalendarAdded) {
        onCalendarAdded(newCalendar);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Failed to add calendar. Please try again.');
      }
      console.error('Error adding calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="add-calendar-form"
    >
      <Form.Item
        name="name"
        rules={[{ required: true, message: 'Please enter a name for this calendar' }]}
      >
        <Input placeholder="Calendar Name" />
      </Form.Item>
      
      <Form.Item
        name="url"
        rules={[
          { required: true, message: 'Please enter the iCal URL' },
          { 
            pattern: /^https?:\/\/.+/i, 
            message: 'URL must start with http:// or https://' 
          }
        ]}
      >
        <Input placeholder="iCal URL (https://...)" />
      </Form.Item>
      
      <Form.Item>
        <Tooltip title="Add Calendar">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<PlusOutlined />}
            block
          >
            Add Calendar
          </Button>
        </Tooltip>
      </Form.Item>
    </Form>
  );
};

export default AddCalendarForm;
