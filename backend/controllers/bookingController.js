import Booking from '../models/Booking.js';
import User from '../models/User.js';

/**
 * CREATE BOOKING
 * Ensures the specific skill (category) is saved to the database.
 */
export const createBooking = async (req, res) => {
  try {
    const { proId, category } = req.body;
    const clientId = req.user.id;

    const professional = await User.findById(proId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    const existing = await Booking.findOne({
      client: clientId,
      professional: proId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({
        message: 'You already have a pending request.'
      });
    }

    // FIX: If no category is passed from frontend, 
    // it automatically pulls the professional's primary skill.
    const booking = await Booking.create({
      client: clientId,
      professional: proId,
      category: category || (professional.skills && professional.skills[0]) || 'general',
      location: professional.location || 'unknown',
      status: 'pending'
    });

    res.status(201).json({ success: true, booking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET BOOKINGS
 * Populate includes 'skills' so the frontend can display the correct icon/label.
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let bookings;

    if (userRole === 'pro') {
      bookings = await Booking.find({ professional: userId })
        .populate('client', 'name email phone location')
        .sort('-createdAt');
    } else {
      bookings = await Booking.find({ client: userId })
        // FIX: Added 'skills' to populate so sidebar can fix 'general' labels
        .populate('professional', 'name email phone location skills') 
        .sort('-createdAt');
    }

    res.json({ success: true, bookings });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE STATUS (Professional side)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const proId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, professional: proId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, booking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * RATE BOOKING (Client side)
 */
export const rateBooking = async (req, res) => {
  try {
    const { bookingId, ratingValue } = req.body;
    const clientId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, client: clientId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'approved' && booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    booking.rating = ratingValue;
    await booking.save();

    res.json({ success: true, message: 'Rating submitted' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};