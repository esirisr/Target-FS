import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'accepted', 'rejected'],
    default: 'pending'
  },
  rating: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    default: 'general'
  },
  location: {
    type: String,
    default: 'unknown'
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;