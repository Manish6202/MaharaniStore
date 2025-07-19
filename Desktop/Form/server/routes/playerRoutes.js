const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Player = require('../models/Player');
const verifyToken = require('../middleware/verifyToken');
const { exportPlayersToExcel } = require('../utils/exportExcel');

const router = express.Router();

// Ensure folders exist
const photoDir = path.join(__dirname, '../uploads/photos');
const receiptDir = path.join(__dirname, '../uploads/receipts');
fs.mkdirSync(photoDir, { recursive: true });
fs.mkdirSync(receiptDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'photo') cb(null, photoDir);
    else if (file.fieldname === 'receipt') cb(null, receiptDir);
    else cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Register Player
router.post('/register',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'receipt', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        name, age, address, mobile,
        playingStyle, playerType,
        unavailability, remarks
      } = req.body;

      const photoPath = req.files['photo'] ? `/uploads/photos/${req.files['photo'][0].filename}` : '';
      const receiptPath = req.files['receipt'] ? `/uploads/receipts/${req.files['receipt'][0].filename}` : '';

      const newPlayer = new Player({
        name,
        age,
        address,
        mobile,
        playingStyle,
        playerType,
        unavailability,
        remarks,
        photoUrl: photoPath,
        receiptUrl: receiptPath,
      });

      await newPlayer.save();
      res.status(201).json({ message: 'Register Successful' });
    } catch (err) {
      console.error('Error saving player', err);
      res.status(500).json({ error: 'Failed to register player' });
    }
  }
);

// Get All Players with Optional Search
router.get('/all', verifyToken, async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const players = await Player.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { mobile: { $regex: keyword, $options: 'i' } }
      ]
    });
    res.status(200).json(players);
  } catch (err) {
    console.error('Failed to fetch players:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Export to Excel
router.get('/export', verifyToken, async (req, res) => {
  try {
    const filePath = await exportPlayersToExcel();
    res.download(filePath, 'players.xlsx', () => {
      fs.unlinkSync(filePath); 
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export players' });
  }
});

// Delete Player
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;
