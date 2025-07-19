const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Player = require('../models/Player');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/test';
const PHOTOS_DIR = path.join(__dirname, '../uploads/photos');
const RECEIPTS_DIR = path.join(__dirname, '../uploads/receipts');

async function fixAllPhotosAndReceipts() {
  await mongoose.connect(MONGO_URI);
  const players = await Player.find();
  let updated = 0;
  for (const player of players) {
    // Fix photoUrl
    if (player.photoUrl) {
      const photoFilename = path.basename(player.photoUrl);
      const photoPath = path.join(PHOTOS_DIR, photoFilename);
      if (fs.existsSync(photoPath)) {
        const correctPhotoUrl = `/uploads/photos/${photoFilename}`;
        if (player.photoUrl !== correctPhotoUrl) {
          await Player.updateOne({ _id: player._id }, { $set: { photoUrl: correctPhotoUrl } });
          updated++;
          console.log(`Fixed photoUrl for ${player.name}: ${player.photoUrl} -> ${correctPhotoUrl}`);
        }
      } else {
        console.warn(`Photo file missing for ${player.name}: ${photoPath}`);
      }
    }
    // Fix receiptUrl
    if (player.receiptUrl) {
      const receiptFilename = path.basename(player.receiptUrl);
      const receiptPath = path.join(RECEIPTS_DIR, receiptFilename);
      if (fs.existsSync(receiptPath)) {
        const correctReceiptUrl = `/uploads/receipts/${receiptFilename}`;
        if (player.receiptUrl !== correctReceiptUrl) {
          await Player.updateOne({ _id: player._id }, { $set: { receiptUrl: correctReceiptUrl } });
          updated++;
          console.log(`Fixed receiptUrl for ${player.name}: ${player.receiptUrl} -> ${correctReceiptUrl}`);
        }
      } else {
        console.warn(`Receipt file missing for ${player.name}: ${receiptPath}`);
      }
    }
  }
  await mongoose.disconnect();
  console.log(`Total updated: ${updated}`);
}

fixAllPhotosAndReceipts().catch(err => {
  console.error('Error fixing photo/receipt URLs:', err);
  process.exit(1);
}); 