import User from '../models/User.js';
import Booking from '../models/Booking.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPros = await User.countDocuments({ role: 'pro' });
    const verifiedPros = await User.countDocuments({ role: 'pro', isVerified: true });
    const suspendedPros = await User.countDocuments({ role: 'pro', isSuspended: true });
    const totalBookings = await Booking.countDocuments();

    const usersPerLocation = await User.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } }
    ]);

    const prosPerLocation = await User.aggregate([
      { $match: { role: 'pro' } },
      { $group: { _id: '$location', count: { $sum: 1 } } }
    ]);

    const skillsDistribution = await User.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } }
    ]);

    const requestsPerLocation = await Booking.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } }
    ]);

    const bookingsPerCategory = await Booking.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      totalPros,
      verifiedPros,
      suspendedPros,
      totalBookings,
      usersPerLocation,
      prosPerLocation,
      skillsDistribution,
      requestsPerLocation,
      bookingsPerCategory,
      monthlyBookings,
      usersByMonth
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Analytics error' });
  }
};