const mongoose = require('mongoose');
const uri = process.argv[2] || process.env.MONGO_URI;

console.log('Connecting to:', uri);
mongoose.connect(uri)
  .then(() => {
    console.log('Connected!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
