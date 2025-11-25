import React from 'react';
import { Layout, Menu, Button, Divider, Typography, Tooltip } from 'antd';
import { 
  CalendarOutlined, 
  ReloadOutlined, 
  PlusOutlined 
} from '@ant-design/icons';
import AddCalendarForm from '../iCalManager/AddCalendarForm';
import CalendarList from '../iCalManager/CalendarList';

const { Sider } = Layout;
const { Title } = Typography;

const AppSidebar = ({ 
  collapsed, 
  calendars, 
  onCalendarAdded, 
  onCalendarRemoved, 
  onRefresh,
  refreshing
}) => {
  return (
    <Sider
      width={300}
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
      }}
    >
      <div style={{ padding: collapsed ? '16px 0' : 16 }}>
        {!collapsed && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                Calendars
              </Title>
              <Tooltip title="Refresh All Calendars">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={onRefresh}
                  loading={refreshing}
                  type="text"
                />
              </Tooltip>
            </div>
            
            <AddCalendarForm onCalendarAdded={onCalendarAdded} />
            
            <Divider style={{ margin: '16px 0' }} />
            
            <CalendarList 
              calendars={calendars} 
              onCalendarRemoved={onCalendarRemoved}
              onCalendarAdded={onCalendarAdded}
            />
          </>
        )}
        
        {collapsed && (
          <Menu
            mode="inline"
            items={[
              {
                key: 'calendars',
                icon: <CalendarOutlined />,
                label: 'Calendars',
              },
              {
                key: 'refresh',
                icon: <ReloadOutlined spin={refreshing} />,
                label: 'Refresh',
                onClick: onRefresh,
              },
              {
                key: 'add',
                icon: <PlusOutlined />,
                label: 'Add',
              },
            ]}
          />
        )}
      </div>
    </Sider>
  );
};

export default AppSidebar;
