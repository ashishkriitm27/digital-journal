const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/User');
const Entry = require('./models/Entry'); 

dotenv.config();

const app = express();
app.use(express.json());

// ==================== CORRECT CORS CONFIGURATION ====================
app.use(cors({
    origin: 'https://digital-journal-beryl.vercel.app', // Tumhara exact Vercel link
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected successfully! 🚀"))
  .catch((err) => console.error("Database connection error:", err));

// ==================== AUTH MIDDLEWARE ====================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided, authorization denied!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid hai!" });
  }
};

// ==================== AUTH ROUTES ====================

// 1. Refresh Check (User Data Persistence)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-googleId");
    if (!user) return res.status(404).json({ message: "User nahi mila" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Google OAuth Login/Signup
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required!" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ name, email, googleId, avatar });
      await user.save();
    }

    const sessionToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Success",
      token: sessionToken,
      user: { name: user.name, email: user.email, avatar: user.avatar, role: user.role }
    });
  } catch (error) {
    res.status(401).json({ message: "Google Authentication Failed!" });
  }
});


// ==================== CRUD OPERATIONS (FOR JOURNAL ENTRIES) ====================

// 3. CREATE
app.post('/api/entries', authMiddleware, async (req, res) => {
  const { title, category, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: "Title aur Content zaroori hain!" });
  }

  try {
    const newEntry = new Entry({
      user: req.userId, 
      title,
      category,
      content
    });

    await newEntry.save();
    res.status(201).json({ message: "Entry publish ho gayi!", entry: newEntry });
  } catch (error) {
    res.status(500).json({ message: "Entry save karne mein dikkat aayi." });
  }
});

// 4. READ
app.get('/api/entries', authMiddleware, async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ entries });
  } catch (error) {
    res.status(500).json({ message: "Entries fetch nahi ho payiin." });
  }
});

// 5. DELETE
app.delete('/api/entries/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: "Entry nahi mili ya unauthorized!" });
    
    res.status(200).json({ message: "Entry deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Delete karne mein error aaya." });
  }
});

// 6. UPDATE
app.put('/api/entries/:id', authMiddleware, async (req, res) => {
  const { title, category, content } = req.body;
  
  try {
    const updatedEntry = await Entry.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, category, content },
      { new: true } 
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry nahi mili ya unauthorized!" });
    }

    res.status(200).json({ message: "Entry update ho gayi!", entry: updatedEntry });
  } catch (error) {
    res.status(500).json({ message: "Update karne mein error aaya." });
  }
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT} 🔥`);
});