const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Player = require('../models/Player');

const MONGO_URI = 'mongodb+srv://manish620287:4yCeRNNf4liL3613@cluster0.cmrplk7.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
const PHOTOS_DIR = path.join(__dirname, '../uploads/photos');

async function checkMissingPhotos() {
  await mongoose.connect(MONGO_URI);
  const players = await Player.find();
  players.forEach(p => {
    if (p.photoUrl) {
      const filename = path.basename(p.photoUrl);
      const photoPath = path.join(PHOTOS_DIR, filename);
      if (!fs.existsSync(photoPath)) {
        console.log(`Missing: ${p.name} (${p.photoUrl})`);
      }
    }
  });
  await mongoose.disconnect();
}

checkMissingPhotos(); 