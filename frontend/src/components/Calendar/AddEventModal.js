import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, DatePicker, TimePicker, Switch, message, Select } from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { createEvent, getOrCreateLocalCalendar } from '../../services/apiService';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AddEventModal = ({ visible, onClose, onEventCreated, initialDate, initialTime }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [localCalendar, setLocalCalendar] = useState(null);
  const [allDay, setAllDay] = useState(false);

  useEffect(() => {
    // Get or create the local calendar when component mounts
    const initializeLocalCalendar = async () => {
      try {
        const calendar = await getOrCreateLocalCalendar();
        setLocalCalendar(calendar);
      } catch (error) {
        console.error('Failed to initialize local calendar:', error);
        message.error('Failed to initialize local calendar');
      }
    };

    if (visible) {
      initializeLocalCalendar();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && initialDate) {
      // Set initial form values when modal opens with a specific date/time
      const startMoment = moment(initialDate);
      if (initialTime) {
        startMoment.hour(initialTime.hour).minute(initialTime.minute);
      }
      const endMoment = startMoment.clone().add(1, 'hour');

      form.setFieldsValue({
        title: '',
        description: '',
        location: '',
        start_time: startMoment,
        end_time: endMoment,
        all_day: false
      });
    }
  }, [visible, initialDate, initialTime, form]);

  const handleSubmit = async (values) => {
    if (!localCalendar) {
      message.error('Local calendar not available');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        calendar_id: localCalendar.id,
        title: values.title,
        description: values.description || '',
        location: values.location || '',
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        all_day: values.all_day || false
      };

      const newEvent = await createEvent(eventData);
      message.success(`Event "${values.title}" created successfully`);
      form.resetFields();
      
      if (onEventCreated) {
        onEventCreated(newEvent);
      }
      
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Failed to create event. Please try again.');
      }
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleAllDayChange = (checked) => {
    setAllDay(checked);
    if (checked) {
      // For all-day events, set times to start and end of day
      const startDate = form.getFieldValue('start_time');
      const endDate = form.getFieldValue('end_time');
      
      if (startDate && moment.isMoment(startDate)) {
        const newStartDate = moment(startDate).startOf('day');
        const newEndDate = moment(endDate || startDate).endOf('day');
        
        form.setFieldsValue({
          start_time: newStartDate,
          end_time: newEndDate
        });
      }
    }
  };

  // Add a handler to prevent date picker issues
  const handleDateChange = (fieldName) => (date) => {
    if (date && moment.isMoment(date)) {
      form.setFieldValue(fieldName, moment(date));
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined />
          Create New Event
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          all_day: false
        }}
      >
        <Form.Item
          name="title"
          label="Event Title"
          rules={[{ required: true, message: 'Please enter an event title' }]}
        >
          <Input placeholder="Enter event title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea 
            placeholder="Enter event description (optional)" 
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="location"
          label="Location"
        >
          <Input placeholder="Enter event location (optional)" />
        </Form.Item>

        <Form.Item
          name="all_day"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="All Day" 
            unCheckedChildren="Timed" 
            onChange={handleAllDayChange}
          />
        </Form.Item>

        {!allDay ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="start_time"
              label="Start Date & Time"
              rules={[{ required: true, message: 'Please select start time' }]}
              style={{ flex: 1 }}
              getValueFromEvent={(e) => {
                if (!e || !e.target) return null;
                return moment(e.target.value);
              }}
              getValueProps={(value) => ({
                value: value ? value.format('YYYY-MM-DDTHH:mm') : ''
              })}
            >
              <input
                type="datetime-local"
                style={{
                  width: '100%',
                  padding: '4px 11px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.5715',
                  transition: 'all 0.3s'
                }}
                placeholder="Select start time"
              />
            </Form.Item>

            <Form.Item
              name="end_time"
              label="End Date & Time"
              rules={[{ required: true, message: 'Please select end time' }]}
              style={{ flex: 1 }}
              getValueFromEvent={(e) => {
                if (!e || !e.target) return null;
                return moment(e.target.value);
              }}
              getValueProps={(value) => ({
                value: value ? value.format('YYYY-MM-DDTHH:mm') : ''
              })}
            >
              <input
                type="datetime-local"
                style={{
                  width: '100%',
                  padding: '4px 11px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.5715',
                  transition: 'all 0.3s'
                }}
                placeholder="Select end time"
              />
            </Form.Item>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="start_time"
              label="Start Date"
              rules={[{ required: true, message: 'Please select start date' }]}
              style={{ flex: 1 }}
              getValueFromEvent={(e) => {
                if (!e || !e.target) return null;
                return moment(e.target.value).startOf('day');
              }}
              getValueProps={(value) => ({
                value: value ? value.format('YYYY-MM-DD') : ''
              })}
            >
              <input
                type="date"
                style={{
                  width: '100%',
                  padding: '4px 11px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.5715',
                  transition: 'all 0.3s'
                }}
                placeholder="Select start date"
              />
            </Form.Item>

            <Form.Item
              name="end_time"
              label="End Date"
              rules={[{ required: true, message: 'Please select end date' }]}
              style={{ flex: 1 }}
              getValueFromEvent={(e) => {
                if (!e || !e.target) return null;
                return moment(e.target.value).endOf('day');
              }}
              getValueProps={(value) => ({
                value: value ? value.format('YYYY-MM-DD') : ''
              })}
            >
              <input
                type="date"
                style={{
                  width: '100%',
                  padding: '4px 11px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.5715',
                  transition: 'all 0.3s'
                }}
                placeholder="Select end date"
              />
            </Form.Item>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<PlusOutlined />}
          >
            Create Event
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddEventModal;
