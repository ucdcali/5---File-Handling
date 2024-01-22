// Importing necessary modules
import express from 'express';
import * as statController from '../controllers/statController.js';
import * as uploadController from '../controllers/uploadController.js';

// Create a router object
const router = express.Router();

// Home page route
router.get('/', statController.home);
router.get('/offense', statController.offense);
router.get('/defense', statController.defense);
router.get('/game-log', statController.loadGameLog);
router.post('/submitPlay', statController.submitPlay);

router.get('/deleteAll', statController.deleteAll);

router.post('/uploadImage/:id', uploadController.processUpload, uploadController.uploadFile);


// Export the router
export default router;
