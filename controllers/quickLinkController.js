const QuickLink = require('../models/QuickLink');
const cloudinary = require('../config/cloudinary');

exports.createQuickLink = async (req, res) => {
  try {
    const { title, content, link } = req.body;
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const quickLink = await QuickLink.create({
      title,
      content,
      link,
      image: imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json(quickLink);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllQuickLinks = async (req, res) => {
  const links = await QuickLink.find().populate('createdBy', 'name email');
  res.json(links);
};

exports.getQuickLinkById = async (req, res) => {
  const link = await QuickLink.findById(req.params.id).populate('createdBy', 'name email');
  if (!link) return res.status(404).json({ message: 'Quick Link not found' });
  res.json(link);
};

exports.updateQuickLink = async (req, res) => {
  try {
    const { title, content, link } = req.body;
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const updated = await QuickLink.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        link,
        ...(imageUrl && { image: imageUrl }),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteQuickLink = async (req, res) => {
  const link = await QuickLink.findByIdAndDelete(req.params.id);
  if (!link) return res.status(404).json({ message: 'Quick Link not found' });
  res.json({ message: 'Quick Link deleted' });
};
