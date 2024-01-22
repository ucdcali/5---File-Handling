import FBPlayer from '../models/FBPlayer.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

const processUpload = upload.single('playerImage'); // Multer middleware for single file upload

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or file type not allowed.');
  }

  console.log(req.file.originalname);
  const fileName = req.file.originalname.split('.')[0] + '-' + Date.now() + path.extname(req.file.originalname);
  const filePath = path.join(uploadDir, fileName);
  console.log(filePath);
  const fileUrl = `/uploads/${fileName}`;
  
  try {
    await sharp(req.file.buffer)
      .resize(300)
      .toFile(filePath);
    
    const playerId = req.params.id;

    // Validate if player exists
    const player = await FBPlayer.findById(playerId);
    if (!player) {
      return res.status(404).send('Player not found.');
    }

    // Update the player's image URL in the database
    player.playerImage = fileUrl;
    await player.save();

    console.log('file uploaded!');
    res.redirect('/');
  } catch (error) {
      res.status(500).send('Error processing file' + error);
  }
};

export { processUpload, uploadFile };
