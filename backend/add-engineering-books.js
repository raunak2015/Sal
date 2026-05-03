require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI.replace(/^"|"$|'/g, '').trim())
.then(async () => {
  console.log('Connected. Adding engineering books...');
  const newBooks = [
    { title: "Introduction to Algorithms", author: "Thomas H. Cormen", quantity: 5, rentCost: 60, coverIcon: "📘" },
    { title: "Design Patterns: Elements of Reusable Object-Oriented Software", author: "Erich Gamma", quantity: 3, rentCost: 55, coverIcon: "📙" },
    { title: "Clean Code: A Handbook of Agile Software Craftsmanship", author: "Robert C. Martin", quantity: 4, rentCost: 50, coverIcon: "📗" },
    { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", quantity: 2, rentCost: 65, coverIcon: "🤖" },
    { title: "Engineering Mechanics: Dynamics", author: "J.L. Meriam", quantity: 3, rentCost: 45, coverIcon: "⚙️" }
  ];

  for (const b of newBooks) {
    const exists = await Book.findOne({ title: b.title });
    if (!exists) {
      await Book.create(b);
      console.log(`Added: ${b.title}`);
    }
  }

  console.log('Done!');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
