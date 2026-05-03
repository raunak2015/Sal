require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI.replace(/^"|"$|'/g, '').trim())
.then(async () => {
  console.log('Connected. Adding GTU curriculum books with images...');
  const newBooks = [
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

  for (const b of newBooks) {
    const exists = await Book.findOne({ title: b.title });
    if (!exists) {
      await Book.create(b);
      console.log(`Added: ${b.title}`);
    } else {
      // Update the coverIcon if it already exists but doesn't have the image
      if(exists.coverIcon !== b.coverIcon) {
        exists.coverIcon = b.coverIcon;
        await exists.save();
        console.log(`Updated image for: ${b.title}`);
      }
    }
  }

  console.log('Done!');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
