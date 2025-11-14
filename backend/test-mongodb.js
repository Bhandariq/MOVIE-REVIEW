const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie-review';

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide password in output

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connection successful!');
  console.log('✅ Connected to database:', mongoose.connection.name);
  console.log('✅ Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
  
  // Test a simple operation
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Database ping successful!');
  console.log('✅ MongoDB Atlas connection is working correctly.');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection failed!');
  console.error('Error details:', err.message);
  if (err.message.includes('authentication failed')) {
    console.error('💡 Tip: Check your username and password in the connection string.');
  } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
    console.error('💡 Tip: Check your cluster URL and network access settings in MongoDB Atlas.');
  } else if (err.message.includes('IP')) {
    console.error('💡 Tip: Make sure your IP address is whitelisted in MongoDB Atlas Network Access.');
  }
  process.exit(1);
});

