const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Yeh is user ki unique id hai jo logged in hai
  },
  title: { type: String, required: true },
  category: { type: String, default: 'Personal' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Entry', entrySchema);