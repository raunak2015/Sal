require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI.replace(/^"|"$|'/g, '').trim())
.then(async () => {
  console.log('Connected. Deleting non-GTU books...');
  
  const result = await Book.deleteMany({ author: { $ne: 'GTU' } });
  console.log(`Deleted ${result.deletedCount} books that do not belong to GTU.`);
  
  console.log('Done!');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
