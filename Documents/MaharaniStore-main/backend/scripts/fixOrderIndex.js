const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function fixOrderIndex() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // Get all indexes
    const indexes = await ordersCollection.indexes();
    console.log('\n📋 Current indexes on orders collection:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check if orderId index exists
    const orderIdIndex = indexes.find(idx => idx.name === 'orderId_1' || idx.key?.orderId);
    
    if (orderIdIndex) {
      console.log('\n🗑️  Found old orderId index, dropping it...');
      try {
        await ordersCollection.dropIndex('orderId_1');
        console.log('✅ Successfully dropped orderId_1 index');
      } catch (error) {
        // Try alternative index name
        if (error.code === 27) {
          console.log('⚠️  Index name not found, trying to drop by key...');
          try {
            await ordersCollection.dropIndex({ orderId: 1 });
            console.log('✅ Successfully dropped orderId index by key');
          } catch (err) {
            console.log('⚠️  Could not drop index:', err.message);
          }
        } else {
          console.log('⚠️  Error dropping index:', error.message);
        }
      }
    } else {
      console.log('\n✅ No orderId index found - database is clean');
    }

    // Verify orderNumber index exists
    const orderNumberIndex = indexes.find(idx => idx.name === 'orderNumber_1' || idx.key?.orderNumber);
    if (!orderNumberIndex) {
      console.log('\n📝 Creating orderNumber index...');
      await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true });
      console.log('✅ Created orderNumber unique index');
    } else {
      console.log('\n✅ orderNumber index already exists');
    }

    // Get updated indexes
    const updatedIndexes = await ordersCollection.indexes();
    console.log('\n📋 Updated indexes:');
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Database index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
}

fixOrderIndex();

