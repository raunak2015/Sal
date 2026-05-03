const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookName: { type: String, required: true },
  rentalDays: { type: Number, required: true },
  requestDate: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Approved - Payment Pending Offline, Rejected
  approvedCost: { type: Number, default: null },
  rejectionReason: { type: String, default: null }
});

module.exports = mongoose.model('Request', requestSchema);
