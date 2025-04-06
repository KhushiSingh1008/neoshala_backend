import express from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get user notifications
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    // Ensure user can only access their own notifications
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      userId: req.params.userId,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure user can only update their own notifications
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch('/user/:userId/read-all', authenticateToken, async (req, res) => {
  try {
    // Ensure user can only update their own notifications
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Notification.updateMany(
      { userId: req.params.userId },
      { $set: { read: true } }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure user can only delete their own notifications
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
});

// Clear all notifications
router.delete('/user/:userId/clear', authenticateToken, async (req, res) => {
  try {
    // Ensure user can only delete their own notifications
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Notification.deleteMany({ userId: req.params.userId });
    
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 