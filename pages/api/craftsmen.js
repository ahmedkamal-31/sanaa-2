import connectToDatabase from '../../lib/mongodb';
import mongoose from 'mongoose';

// تعريف الـ Schema
const CraftsmanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  job: { type: String, required: true },
  rating: { type: Number, default: 0 },
  distance: { type: String },
  reviews: { type: [String], default: [] }
});

// استخدام نفس الموديل لو موجود بالفعل
const Craftsman =
  mongoose.models.Craftsman || mongoose.model('Craftsman', CraftsmanSchema);

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const craftsmen = await Craftsman.find({});
      return res.status(200).json(craftsmen);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch craftsmen' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const newCraftsman = new Craftsman(body);
      await newCraftsman.save();
      return res.status(201).json(newCraftsman);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to add craftsman' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await Craftsman.findByIdAndDelete(id);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete craftsman' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
