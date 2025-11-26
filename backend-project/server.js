// ===========================================
// 1. IMPORTS & CONFIGURATION
// ===========================================
// CRITICAL: This must be the very first line!
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const app = express();
// Use the PORT from .env, or fallback to 4000
const PORT = process.env.PORT || 4000;

// SAFETY CHECK: Ensure keys exist before starting
if (!process.env.MONGO_URI || !process.env.CLOUDINARY_API_KEY) {
  console.error('❌ FATAL ERROR: Missing .env variables.');
  console.error('Please make sure you created the .env file with MONGO_URI and CLOUDINARY keys.');
  process.exit(1); // Stop the server if config is missing
}

// ===========================================
// 2. MIDDLEWARE
// ===========================================
app.use(cors()); // Allow React Frontend to connect
app.use(express.json()); // Allow reading JSON body

// Cloudinary Config (Using .env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Config (Memory Storage for PDF handling)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ===========================================
// 3. DATABASE CONNECTION
// ===========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    seedAdminUser(); 
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ===========================================
// 4. DATABASE MODELS
// ===========================================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // Plain text for now (will fix later)
  role: { 
    type: String, 
    required: true, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  pdfUrl: { type: String },
  pdfPublicId: { type: String },
});

const User = mongoose.model('User', userSchema, 'user_accounts');

// Seeding Function (Safe Version)
const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Admin not found. Creating default admin...');
      const defaultAdmin = new User({
        username: 'admin',
        name: 'System Administrator',
        // Uses password from .env, or defaults to 'admin'
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin', 
        role: 'admin',
      });
      await defaultAdmin.save();
      console.log('✅ Default admin created successfully.');
    } else {
      console.log('ℹ️ Admin account already exists.');
    }
  } catch (error) {
    console.error('Seed Error:', error);
  }
};

// ===========================================
// 5. API ROUTES
// ===========================================

// --- LOGIN ---
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
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- GET ALL USERS ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Hide password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- CREATE USER ---
app.post('/api/users', async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already taken' });

    const newUser = new User({ username, name, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- GET ONE USER ---
app.get('/api/users/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    user ? res.json(user) : res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- UPDATE USER ---
app.put('/api/users/:username', async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { name, password, role },
      { new: true, runValidators: true }
    );
    updatedUser ? res.json({ message: 'User updated' }) : res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- DELETE USER ---
app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (username === 'admin') return res.status(403).json({ message: 'Cannot delete default admin' });

    const userToDelete = await User.findOneAndDelete({ username });
    if (userToDelete) {
      if (userToDelete.pdfPublicId) {
        await cloudinary.uploader.destroy(userToDelete.pdfPublicId, { resource_type: 'raw' });
      }
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- PDF UPLOAD ---
app.post('/api/users/:username/upload-pdf', upload.single('pdf-file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old PDF if exists
    if (user.pdfPublicId) {
      await cloudinary.uploader.destroy(user.pdfPublicId, { resource_type: 'raw' });
    }

    // Upload new PDF
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'user-pdfs' },
      async (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Cloudinary Upload Failed' });
        }
        
        user.pdfUrl = result.secure_url;
        user.pdfPublicId = result.public_id;
        await user.save();
        res.json({ message: 'Upload successful', url: result.secure_url });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================================
// INVENTORY: RAW MATERIALS SCHEMA
// ===========================================
const rawMaterialSchema = new mongoose.Schema({
  itemCode: { type: String, required: true, unique: true }, // e.g., RM001
  itemName: { type: String, required: true },
  stock: { type: Number, default: 0 },
  unit: { type: String, required: true }, // e.g., kg, pcs, liter
  minStock: { type: Number, default: 10 }, // Threshold for 'Low Stock' status
});

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);


// ===========================================
// INVENTORY: PURCHASE SCHEMA
// ===========================================
const purchaseSchema = new mongoose.Schema({
  parentItemCode: { type: String, required: true }, // Links to RM001
  purchaseCode: { type: String, required: true },   // RM001_001
  date: { type: Date, default: Date.now },
  qty: { type: Number, required: true },
  priceTotal: { type: Number, required: true },     // Total price for this batch
  vendor: { type: String, default: '-' }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

// ===========================================
// PURCHASE: API ROUTES
// ===========================================

// 1. GET HISTORY FOR SPECIFIC MATERIAL
app.get('/api/raw-materials/:itemCode/purchases', async (req, res) => {
  try {
    const { itemCode } = req.params;
    const purchases = await Purchase.find({ parentItemCode: itemCode }).sort({ purchaseCode: 1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. ADD NEW PURCHASE (Auto-Increment _001 Logic)
app.post('/api/raw-materials/:itemCode/purchases', async (req, res) => {
  try {
    const { itemCode } = req.params;
    const { qty, priceTotal, vendor } = req.body;

    // A. FIND PARENT MATERIAL
    const material = await RawMaterial.findOne({ itemCode });
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // B. GENERATE ID (RM001_001, RM001_002...)
    // Find the last purchase for THIS specific material
    const lastPurchase = await Purchase.findOne({ parentItemCode: itemCode })
      .sort({ purchaseCode: -1 }); // Get the latest one

    let nextSuffix = '001';
    
    if (lastPurchase) {
      // Split "RM001_005" -> ["RM001", "005"]
      const parts = lastPurchase.purchaseCode.split('_');
      if (parts.length === 2) {
        const lastNum = parseInt(parts[1], 10);
        nextSuffix = String(lastNum + 1).padStart(3, '0');
      }
    }

    const newPurchaseCode = `${itemCode}_${nextSuffix}`;

    // C. SAVE PURCHASE
    const newPurchase = new Purchase({
      parentItemCode: itemCode,
      purchaseCode: newPurchaseCode,
      qty,
      priceTotal,
      vendor
    });
    await newPurchase.save();

    // D. UPDATE PARENT MATERIAL STOCK (Optional: Add bought qty to stock)
    material.stock += parseInt(qty, 10);
    await material.save();

    res.status(201).json(newPurchase);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add purchase' });
  }
});


// ===========================================
// INVENTORY: API ROUTES
// ===========================================

// 1. GET ALL RAW MATERIALS
app.get('/api/raw-materials', async (req, res) => {
  try {
    const materials = await RawMaterial.find().sort({ itemCode: 1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. CREATE NEW RAW MATERIAL (Auto-Generate RM Code)
app.post('/api/raw-materials', async (req, res) => {
  try {
    const { itemName, unit, stock } = req.body;

    // A. FIND LAST CODE
    // We sort by _id descending to get the newest entry
    const lastMaterial = await RawMaterial.findOne().sort({ _id: -1 });

    let newCode = 'RM001'; // Default if database is empty

    if (lastMaterial && lastMaterial.itemCode) {
      // Extract the number part (e.g., from 'RM005' get '005')
      const lastCodeStr = lastMaterial.itemCode.replace('RM', '');
      const lastNumber = parseInt(lastCodeStr, 10);
      
      // Increment and pad with zeros (e.g., 6 -> '006')
      const nextNumber = lastNumber + 1;
      newCode = `RM${String(nextNumber).padStart(3, '0')}`;
    }

    // B. SAVE NEW MATERIAL
    const newMaterial = new RawMaterial({
      itemCode: newCode,
      itemName,
      unit,
      stock: stock || 0 // Default to 0 if not provided
    });

    await newMaterial.save();
    res.status(201).json(newMaterial);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create material' });
  }
});

// ===========================================
// 6. SERVER START
// ===========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});