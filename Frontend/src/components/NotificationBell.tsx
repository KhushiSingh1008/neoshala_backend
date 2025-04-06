import React, { useState, useEffect } from 'react';
import { FaBell, FaTimesCircle, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';
import styled from 'styled-components';

interface StyledProps {
  $isOpen?: boolean;
  isRead?: boolean;
  $type?: string;
}

const NotificationContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const BellIcon = styled.div`
  cursor: pointer;
  padding: 8px;
  position: relative;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #e53e3e;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
`;

const NotificationPanel = styled.div<StyledProps>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1000;
`;

const NotificationItem = styled.div<StyledProps>`
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background-color: ${props => props.isRead ? 'white' : '#f7fafc'};
  border-left: 3px solid ${props => {
    if (props.$type === 'course_update') return '#e53e3e';
    if (props.$type === 'course_purchase') return '#38a169';
    if (props.$type === 'payment_confirmation') return '#3182ce';
    return '#cbd5e0';
  }};
  cursor: pointer;

  &:hover {
    background-color: #edf2f7;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
`;

const NotificationBody = styled.p`
  margin: 0;
  font-size: 13px;
  color: #4a5568;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: #718096;
  display: block;
  margin-top: 4px;
`;

const TypeIcon = styled.span`
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
`;

const EmptyNotification = styled.div`
  padding: 16px;
  text-align: center;
  color: #718096;
`;

const ClearAllButton = styled.button`
  width: 100%;
  padding: 8px;
  background-color: #f7fafc;
  border: none;
  border-top: 1px solid #e2e8f0;
  color: #4a5568;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #edf2f7;
  }
`;

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, clearAll, fetchNotifications } = useNotifications();

  // Fetch notifications when the component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const formatTime = (date: Date) => {
    try {
      const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (isNaN(diffDays)) {
        return 'Unknown date';
      }
      
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-diffDays, 'day');
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  const handleBellClick = () => {
    // Refresh notifications when bell is clicked
    fetchNotifications();
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_purchase':
        return <FaCheckCircle color="#38a169" />;
      case 'payment_confirmation':
        return <FaMoneyBillWave color="#3182ce" />;
      case 'course_update':
        return <FaTimesCircle color="#e53e3e" />;
      default:
        return null;
    }
  };

  return (
    <NotificationContainer>
      <BellIcon onClick={handleBellClick}>
        <FaBell size={20} />
        {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
      </BellIcon>

      <NotificationPanel $isOpen={isOpen}>
        {notifications && notifications.length > 0 ? (
          <>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                isRead={notification.read}
                $type={notification.type}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <NotificationTitle>
                  <TypeIcon>
                    {getNotificationIcon(notification.type)}
                  </TypeIcon>
                  {notification.title}
                </NotificationTitle>
                <NotificationBody>{notification.body}</NotificationBody>
                <NotificationTime>
                  {formatTime(notification.createdAt)}
                </NotificationTime>
              </NotificationItem>
            ))}
            <ClearAllButton onClick={() => {
              clearAll();
              setIsOpen(false);
            }}>
              Clear All
            </ClearAllButton>
          </>
        ) : (
          <EmptyNotification>
            No notifications
          </EmptyNotification>
        )}
      </NotificationPanel>
    </NotificationContainer>
  );
}; 