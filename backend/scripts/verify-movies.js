const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie-review';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected\n');
    
    const count = await Movie.countDocuments();
    console.log(`📊 Total movies in database: ${count}\n`);
    
    const sample = await Movie.find().limit(5).sort({ createdAt: -1 });
    console.log('📽️  Latest movies:');
    sample.forEach(m => {
      console.log(`   - ${m.title} (${m.year}) - ${m.genre.join(', ')}`);
    });
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

