import connectToDatabase from '../../lib/mongodb';
import mongoose from 'mongoose';

const CraftsmanSchema = new mongoose.Schema({
  name: String,
  job: String,
  rating: Number,
  distance: String,
  reviews: [String]
});

const BookingSchema = new mongoose.Schema({
  craftId: String,
  craftName: String,
  user: String,
  date: String
});

// استخدم شرط علشان تمنع تكرار تعريف الموديل
const Craftsman = mongoose.models.Craftsman || mongoose.model('Craftsman', CraftsmanSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // امسح البيانات القديمة
    await Craftsman.deleteMany({});
    await Booking.deleteMany({});

    // أضف بيانات تجريبية
    const sampleCraftsmen = [
      {
        name: 'محمد علي',
        job: 'نجار',
        rating: 4.5,
        distance: '2km',
        reviews: ['شغل ممتاز', 'سريع في التنفيذ']
      },
      {
        name: 'أحمد حسن',
        job: 'سباك',
        rating: 4.2,
        distance: '3.5km',
        reviews: ['أسعار مناسبة', 'محترف']
      },
      {
        name: 'سعيد عبد الله',
        job: 'كهربائي',
        rating: 4.8,
        distance: '1.2km',
        reviews: ['دقيق في المواعيد', 'خدمة ممتازة']
      }
    ];

    const sampleBookings = [
      {
        craftId: 'demo1',
        craftName: 'محمد علي',
        user: 'مستخدم تجريبي',
        date: new Date().toLocaleString()
      }
    ];

    await Craftsman.insertMany(sampleCraftsmen);
    await Booking.insertMany(sampleBookings);

    return res.status(200).json({ ok: true, message: 'تم تحميل البيانات التجريبية بنجاح' });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ error: 'فشل تحميل البيانات' });
  }
}
