const mongoose = require('mongoose');
const Player = require('../models/Player');

const MONGO_URI = 'mongodb+srv://manish620287:4yCeRNNf4liL3613@cluster0.cmrplk7.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function listPhotos() {
  await mongoose.connect(MONGO_URI);
  const players = await Player.find();
  players.forEach(p => {
    console.log(`${p.name}: ${p.photoUrl}`);
  });
  await mongoose.disconnect();
}

listPhotos(); 