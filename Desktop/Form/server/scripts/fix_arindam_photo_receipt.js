const mongoose = require('mongoose');
const Player = require('../models/Player');

const MONGO_URI = 'mongodb+srv://manish620287:4yCeRNNf4liL3613@cluster0.cmrplk7.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function fixArindam() {
  await mongoose.connect(MONGO_URI);
  const result = await Player.updateOne(
    { _id: '687772eca99c2c7f6d47b654' },
    {
      $set: {
        photoUrl: '/uploads/photos/photo-1752658668435-366385158.jpeg',
        receiptUrl: '/uploads/receipts/receipt-1752658668436-259955849.jpg',
      },
    }
  );
  console.log('Update result:', result);
  await mongoose.disconnect();
}

fixArindam().catch(err => {
  console.error('Error updating Arindam:', err);
  process.exit(1);
}); 