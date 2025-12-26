require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('\n📋 Environment Check:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    const match = process.env.MONGODB_URI.match(/\.net\/([^?]+)/);
    console.log('Expected Database:', match ? match[1] : 'NOT FOUND');
    
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected successfully!');
    console.log('📊 Actual Database:', dbName);
    
    if (dbName === 'test') {
      console.log('✅ SUCCESS: Connected to "test" database!');
    } else {
      console.log('❌ ERROR: Connected to wrong database!');
      console.log('Expected: test');
      console.log('Got:', dbName);
    }
    
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
