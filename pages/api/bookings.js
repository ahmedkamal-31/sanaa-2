import connectToDatabase from '../../lib/mongodb';
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  craftId: String,
  craftName: String,
  user: String,
  date: { type: String, default: () => new Date().toLocaleString() }
});

const Booking =
  mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const bookings = await Booking.find({});
      return res.status(200).json(bookings);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const newBooking = new Booking(body);
      await newBooking.save();
      return res.status(201).json(newBooking);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to add booking' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await Booking.findByIdAndDelete(id);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete booking' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
