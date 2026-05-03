require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Book = require('./models/Book');
const Request = require('./models/Request');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI.replace(/^"|"$|'/g, '').trim())
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Initial data seeding
const DEFAULT_BOOKS = [
  { title: "Basic Electrical Engineering", author: "GTU", quantity: 5, rentCost: 40, coverIcon: "/books/BEE.png" },
  { title: "Basic Mechanical Engineering", author: "GTU", quantity: 6, rentCost: 45, coverIcon: "/books/BME.png" },
  { title: "Complex Variables & Partial Diff. Eq.", author: "GTU", quantity: 4, rentCost: 50, coverIcon: "/books/CVPDE.png" },
  { title: "Engineering Graphics and Design", author: "GTU", quantity: 5, rentCost: 55, coverIcon: "/books/EGD.png" },
  { title: "Effective Technical Communication", author: "GTU", quantity: 8, rentCost: 30, coverIcon: "/books/ETC.png" },
  { title: "Fundamentals of AI", author: "GTU", quantity: 3, rentCost: 60, coverIcon: "/books/FAI.png" },
  { title: "Universal Human Values", author: "GTU", quantity: 10, rentCost: 20, coverIcon: "/books/UHV.png" },
  { title: "Basic Electronic Engineering", author: "GTU", quantity: 4, rentCost: 45, coverIcon: "/books/basic eletronic engineering.png" },
  { title: "Engineering Mathematics 1", author: "GTU", quantity: 7, rentCost: 40, coverIcon: "/books/maths1.png" },
  { title: "Engineering Mathematics 2", author: "GTU", quantity: 6, rentCost: 40, coverIcon: "/books/maths2.png" },
  { title: "Engineering Mathematics 3", author: "GTU", quantity: 5, rentCost: 40, coverIcon: "/books/maths3.png" },
  { title: "Engineering Physics", author: "GTU", quantity: 5, rentCost: 35, coverIcon: "/books/physics.png" },
  { title: "Programming for Problem Solving", author: "GTU", quantity: 8, rentCost: 50, coverIcon: "/books/pps.png" },
];

const seedBooks = async () => {
  const count = await Book.countDocuments();
  if (count === 0) {
    await Book.insertMany(DEFAULT_BOOKS);
    console.log('Database seeded with default books');
  }
};
mongoose.connection.once('open', seedBooks);

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'student' });
    await user.save();

    const token = jwt.sign({ email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    // Hardcoded Admin logic for simplicity, or could be added to DB
    if (role === 'admin' && email === 'admin@sal.edu' && password === 'admin123') {
      const token = jwt.sign({ email, role, name: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, user: { email, role, name: 'Admin' } });
    }

    // Student logic - Check DB
    if (role === 'student') {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'User not found' });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      
      const token = jwt.sign({ email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, user: { email: user.email, role: user.role, name: user.name } });
    }

    res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// --- Book Routes ---
app.get('/api/books', authenticateToken, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/books', authenticateToken, isAdmin, async (req, res) => {
  try {
    const book = new Book(req.body);
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/books/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/books/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Request Routes ---
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    let query = {};
    // Students only see their own requests
    if (req.user.role === 'student') {
      query = { studentEmail: req.user.email };
    }
    const requests = await Request.find(query).sort({ _id: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const request = new Request({
      ...req.body,
      studentEmail: req.user.email,
      requestDate: new Date().toISOString().split('T')[0]
    });
    const newRequest = await request.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/requests/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, approvedCost, rejectionReason } = req.body;
    
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    
    if (status.includes('Approved')) {
      request.approvedCost = approvedCost;
      // Decrease book quantity
      const book = await Book.findById(request.bookId);
      if (book && book.quantity > 0) {
        book.quantity -= 1;
        await book.save();
      }
    } else if (status === 'Rejected') {
      request.rejectionReason = rejectionReason;
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
