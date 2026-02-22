import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  professional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5,
    default: null 
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; // ✅ ES module default export