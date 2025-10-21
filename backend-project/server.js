// ===========================================
// IMPOR & KONFIGURASI
// ===========================================
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const app = express();
const PORT = 4000;

// Ganti dengan kredensial Anda!
const MONGO_URI = 'mongodb+srv://fries_user:Proxxys_120804@cluster0.7gitt3q.mongodb.net/POS_BREAD_WEB?retryWrites=true&w=majority&appName=Cluster0';
const CLOUDINARY_CLOUD_NAME = 'doyo1dmam';
const CLOUDINARY_API_KEY = '131242345393254';
const CLOUDINARY_API_SECRET = 'JOx0T80zWQR6c-hCQSdKxdfyccw';

// ===========================================
// MIDDLEWARE
// ===========================================
app.use(cors()); // Izinkan koneksi dari React
app.use(express.json()); // Izinkan server membaca JSON

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Konfigurasi Multer untuk menangani upload file di memori
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ===========================================
// KONEKSI DATABASE
// ===========================================
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🚀 Berhasil terhubung ke MongoDB Atlas');
    // JALANKAN FUNGSI UNTUK MEMBUAT ADMIN DEFAULT
    seedAdminUser(); 
  })
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// ===========================================
// SKEMA & MODEL DATABASE
// ===========================================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['user', 'admin'], // ATURAN #2: Hanya 'user' dan 'admin'
    default: 'user'           // ATURAN #1: Default 'user'
  },
  pdfUrl: { type: String },
  pdfPublicId: { type: String },
});

const User = mongoose.model('User', userSchema, 'user_accounts');

// ===========================================
// FUNGSI SEED ADMIN (ATURAN #3)
// ===========================================
const seedAdminUser = async () => {
  try {
    // 1. Cek apakah sudah ada user dengan role 'admin'
    const adminExists = await User.findOne({ role: 'admin' });

    // 2. Jika tidak ada, buat satu
    if (!adminExists) {
      console.log('Tidak ditemukan admin, membuat admin default...');
      const defaultAdmin = new User({
        username: 'admin',
        name: 'Admin Awal',
        password: 'admin', // Ganti password ini di production!
        role: 'admin',
      });
      await defaultAdmin.save();
      console.log('Admin default berhasil dibuat dengan username: admin, password: admin');
    } else {
      console.log('User admin sudah ada di database.');
    }
  } catch (error) {
    console.error('Error saat seeding admin user:', error);
  }
};


// ===========================================
// API ENDPOINTS (RUTE)
// (Semua endpoint di bawah ini tidak perlu diubah,
// karena validasi sudah ditangani oleh Schema)
// ===========================================

// --- 1. LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (user) {
      res.json({
        username: user.username,
        name: user.name,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Username atau password salah' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- 2. GET ALL USERS ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    const usersForClient = users.map(u => ({
      username: u.username,
      name: u.name,
      role: u.role,
      passwordDisplay: '••••••••',
    }));
    res.json(usersForClient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- 3. CREATE NEW USER ---
app.post('/api/users', async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }
    // Schema akan otomatis memvalidasi role & set default jika tidak ada
    const newUser = new User({ username, name, password, role }); 
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    // Jika error validasi (misal: role selain 'user'/'admin')
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// --- 4. GET ONE USER ---
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- 5. UPDATE USER ---
app.put('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { name, password, role } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { name, password, role }, // Schema akan memvalidasi role
      { new: true, runValidators: true } // 'runValidators' penting untuk update
    );

    if (updatedUser) {
      res.json({ message: 'User berhasil diupdate' });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Tambahkan pengaman agar admin default tidak bisa dihapus
    if (username === 'admin') {
      return res.status(403).json({ message: 'Admin default tidak dapat dihapus.' });
    }

    const userToDelete = await User.findOneAndDelete({ username: username });

    if (userToDelete) {
      // Jika user punya PDF, hapus juga dari Cloudinary
      if (userToDelete.pdfPublicId) {
        await cloudinary.uploader.destroy(userToDelete.pdfPublicId, { resource_type: 'raw' });
      }
      res.json({ message: `User ${username} berhasil dihapus.` });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- 6. UPLOAD/UPDATE PDF ---
app.post('/api/users/:username/upload-pdf', upload.single('pdf-file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang di-upload' });
    }

    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Jika user sudah punya PDF, hapus yang lama dari Cloudinary
    if (user.pdfPublicId) {
      await cloudinary.uploader.destroy(user.pdfPublicId, { resource_type: 'raw' });
    }

    // Upload file baru ke Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'user-pdfs' }, // 'raw' untuk PDF
      async (error, result) => {
        if (error) {
          console.error('Gagal upload ke Cloudinary:', error);
          return res.status(500).json({ message: 'Upload gagal' });
        }
        
        // Simpan URL dan ID file baru ke database
        user.pdfUrl = result.secure_url;
        user.pdfPublicId = result.public_id;
        await user.save();
        
        res.json({ 
          message: 'File berhasil di-upload!', 
          url: result.secure_url 
        });
      }
    );
    
    // Kirim buffer file ke stream Cloudinary
    uploadStream.end(req.file.buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===========================================
// JALANKAN SERVER
// ===========================================
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});