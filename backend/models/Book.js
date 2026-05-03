const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  rentCost: { type: Number, required: true, min: 0 },
  coverIcon: { type: String, default: '📚' }
});

module.exports = mongoose.model('Book', bookSchema);
