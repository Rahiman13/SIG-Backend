const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const Card = require('../models/Card');  // Assuming you have a Card model

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');  // Store file temporarily in local 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Append timestamp to filename
  },
});

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Max file size 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  },
}).single('image');  // The name attribute for the file input in your form is 'image'

// Card creation logic with image upload to Cloudinary
exports.createCard = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    // Upload the image to Cloudinary
    cloudinary.uploader.upload(req.file.path, { folder: 'cards' }, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
      }

      // Create new card with Cloudinary URL
      const newCard = new Card({
        title: req.body.title,
        description: req.body.description,
        imageUrl: result.secure_url,  // Save the Cloudinary image URL
        imagePublicId: result.public_id,  // Save Cloudinary public ID for future reference (e.g., delete)
        type: req.body.type,
      });

      newCard.save()
        .then((card) => {
          res.status(201).json({ message: 'Card created successfully', card });
        })
        .catch((error) => {
          res.status(500).json({ message: 'Error saving card to database', error });
        });
    });
  });
};

// Get all cards
exports.getCards = (req, res) => {
  Card.find()
    .then((cards) => {
      res.status(200).json(cards);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error fetching cards', error });
    });
};

// Get a specific card by ID
exports.getCardById = (req, res) => {
  const cardId = req.params.id;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
      res.status(200).json(card);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error fetching card details', error });
    });
};

// Update card by ID
exports.updateCard = (req, res) => {
  const cardId = req.params.id;
  Card.findByIdAndUpdate(cardId, req.body, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
      res.status(200).json({ message: 'Card updated successfully', card });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error updating card', error });
    });
};

// Delete card by ID
exports.deleteCard = (req, res) => {
  const cardId = req.params.id;
  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      // Delete image from Cloudinary if card has an image
      if (card.imagePublicId) {
        cloudinary.uploader.destroy(card.imagePublicId, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error deleting image from Cloudinary', error: err });
          }
        });
      }

      res.status(200).json({ message: 'Card deleted successfully' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error deleting card', error });
    });
};

// Get count of cards by category
exports.getCardCountByCategory = (req, res) => {
  const { category } = req.params;
  Card.countDocuments({ type: category })
    .then((count) => {
      res.status(200).json({ category, count });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error counting cards by category', error });
    });
};
