import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { connectDatabase } from './config/db.js';
import { User, Post, Category } from './models/index.js';

export async function seedDemoData() {
  const count = await User.countDocuments();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash('password', 12);
  const [admin, rahim, sadia, tanvir] = await User.create([
    { username: 'admin', fullName: 'System Admin', email: 'admin@lostfound.local', passwordHash, role: 'admin', isVerified: true, phone: '+8801700000000', country: 'BD' },
    { username: 'rahim', fullName: 'Rahim Ahmed', email: 'rahim@example.com', passwordHash, isVerified: true, phone: '+8801711000001', country: 'BD' },
    { username: 'sadia', fullName: 'Sadia Islam', email: 'sadia@example.com', passwordHash, isVerified: true, phone: '+8801711000002', country: 'BD' },
    { username: 'tanvir', fullName: 'Tanvir Hasan', email: 'tanvir@example.com', passwordHash, isVerified: true, phone: '+8801711000003', country: 'BD' }
  ]);

  await Category.create([
    { name: 'Electronics', slug: 'electronics', icon: 'mobile-screen' },
    { name: 'Bags & Wallets', slug: 'bag', icon: 'bag-shopping' },
    { name: 'Keys', slug: 'key', icon: 'key' },
    { name: 'Documents', slug: 'paper', icon: 'file-lines' },
    { name: 'Pets', slug: 'pets', icon: 'paw' },
    { name: 'Jewelry', slug: 'jewelry', icon: 'gem' }
  ]);

  await Post.create([
    { user: rahim._id, title: 'Lost Black Leather Wallet', description: 'Black wallet with ID and cards near food court.', itemType: 'lost', category: 'bag', locationName: 'Bashundhara City Food Court, Dhaka', dateOccurred: '2026-05-10', publicContact: '+8801711000001', priorityLevel: 'important' },
    { user: sadia._id, title: 'Found Black Wallet Near Food Court', description: 'Wallet found beside escalator.', itemType: 'found', category: 'bag', locationName: 'Bashundhara City Food Court, Dhaka', dateOccurred: '2026-05-11', publicContact: '+8801711000002' },
    { user: rahim._id, title: 'Lost Blue Backpack', description: 'Blue backpack with charger and notebook.', itemType: 'lost', category: 'bag', locationName: 'Dhanmondi 27 Bus Stop, Dhaka', dateOccurred: '2026-05-12', publicContact: '+8801711000003', priorityLevel: 'important' },
    { user: tanvir._id, title: 'Found Key Ring With Three Keys', description: 'Silver key ring near library.', itemType: 'found', category: 'key', locationName: 'Central Library Entrance, Dhaka', dateOccurred: '2026-05-13', publicContact: '+8801711000004' },
    { user: sadia._id, title: 'Lost Samsung Phone', description: 'Samsung in clear case, blue wallpaper.', itemType: 'lost', category: 'electronics', locationName: 'Gulshan 1 Circle, Dhaka', dateOccurred: '2026-05-14', publicContact: '+8801711000005', priorityLevel: 'emergency' },
    { user: tanvir._id, title: 'Found Student ID Card', description: 'ID card near main gate.', itemType: 'found', category: 'paper', locationName: 'University Main Gate, Dhaka', dateOccurred: '2026-05-15', publicContact: '+8801711000006' }
  ]);

  console.log('MongoDB seeded. Demo users: rahim@example.com / password, admin@lostfound.local / password');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await connectDatabase();
  await seedDemoData();
  process.exit(0);
}
