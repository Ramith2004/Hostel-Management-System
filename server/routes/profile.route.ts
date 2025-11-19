import { Router } from 'express';
import PrismaClient from '../utils/prisma.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = PrismaClient;

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true, // Changed from profilePicture to profilePhoto
        createdAt: true,
        studentProfile: {
          select: {
            enrollmentNumber: true,
            course: true,
            year: true,
            department: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format response
    const userData = {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      profilePicture: user.profilePhoto || '', // Map profilePhoto to profilePicture for frontend
      department: user.studentProfile?.department || '',
      registrationNumber: user.studentProfile?.enrollmentNumber || '',
      createdAt: user.createdAt
    };

    res.json({ user: userData });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

// Upload profile picture
router.post('/profile-picture', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { profilePicture } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!profilePicture) {
      return res.status(400).json({ message: 'Profile picture URL is required' });
    }

    // Update profilePhoto field (not profilePicture)
    await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: profilePicture }
    });

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture 
    });
  } catch (error: any) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Failed to update profile picture', error: error.message });
  }
});

// Update profile information
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true,
        createdAt: true,
      }
    });

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        profilePicture: updatedUser.profilePhoto || '',
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export default router;