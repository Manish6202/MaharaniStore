const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Player = require('../models/Player');

const MONGO_URI = 'mongodb+srv://manish620287:4yCeRNNf4liL3613@cluster0.cmrplk7.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
const PHOTOS_DIR = path.join(__dirname, '../uploads/photos');

async function fixAllPhotos() {
  await mongoose.connect(MONGO_URI);
  const players = await Player.find();
  let updated = 0;
  for (const player of players) {
    if (!player.photoUrl) continue;
    const filename = path.basename(player.photoUrl);
    const photoPath = path.join(PHOTOS_DIR, filename);
    if (fs.existsSync(photoPath)) {
      const correctUrl = `/uploads/photos/${filename}`;
      if (player.photoUrl !== correctUrl) {
        await Player.updateOne({ _id: player._id }, { $set: { photoUrl: correctUrl } });
        updated++;
        console.log(`Updated ${player.name}: ${player.photoUrl} -> ${correctUrl}`);
      }
    } else {
      console.warn(`Photo file missing for ${player.name}: ${photoPath}`);
    }
  }
  await mongoose.disconnect();
  console.log(`Total updated: ${updated}`);
}

fixAllPhotos().catch(err => {
  console.error('Error fixing photos:', err);
  process.exit(1);
}); 