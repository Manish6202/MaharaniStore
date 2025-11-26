const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  discount: {
    type: String,
    required: true,
    trim: true
  },
  timeIcon: {
    type: String,
    default: '⏰'
  },
  timeText: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  gradient: {
    type: [String],
    default: ['#FF6B6B', '#FF8E53']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  linkType: {
    type: String,
    enum: ['product', 'subcategory', 'category', 'none'],
    default: 'none'
  },
  linkId: {
    type: String,
    required: function() {
      return this.linkType !== 'none';
    }
  },
  linkLabel: {
    type: String,
    required: function() {
      return this.linkType !== 'none';
    }
  }
}, {
  timestamps: true
});

// Prevent duplicate model compilation
let Offer;
try {
  Offer = mongoose.model('Offer');
} catch (error) {
  Offer = mongoose.model('Offer', offerSchema);
}

module.exports = Offer;
