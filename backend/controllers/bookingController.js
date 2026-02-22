import Booking from '../models/Booking.js';

// @desc    Create a new booking (client only)
// @route   POST /api/bookings/create
// @access  Private (client)
export const createBooking = async (req, res) => {
  try {
    const { proId } = req.body;
    const clientId = req.user.id;

    // Block if there's a pending booking from the last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const existing = await Booking.findOne({
      client: clientId,
      professional: proId,
      status: 'pending',
      createdAt: { $gte: twoHoursAgo }
    });

    if (existing) {
      return res.status(400).json({
        message: 'You already have a pending request for this professional. Please wait for it to be processed or try again later.'
      });
    }

    const booking = await Booking.create({
      client: clientId,
      professional: proId,
      status: 'pending'
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get bookings for the logged-in user (client or professional)
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let bookings;

    if (userRole === 'pro') {
      // Professionals see bookings where they are the professional,
      // with full client details populated.
      bookings = await Booking.find({ professional: userId })
        .populate('client', 'name email phone location')
        .sort('-createdAt');
    } else {
      // Clients see bookings where they are the client,
      // with professional details populated.
      bookings = await Booking.find({ client: userId })
        .populate('professional', 'name email phone location')
        .sort('-createdAt');
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update booking status (professional only)
// @route   PATCH /api/bookings/update-status
// @access  Private (pro)
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
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate a completed booking (client only)
// @route   POST /api/bookings/rate
// @access  Private (client)
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

    // Optional: update professional's average rating
    // You can add logic here to recalculate the pro's overall rating

    res.json({ success: true, message: 'Rating submitted' });
  } catch (error) {
    console.error('Rate booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};