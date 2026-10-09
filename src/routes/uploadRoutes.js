const express = require('express');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/profile-pic', upload.single('profile_pic'), uploadController.uploadProfilePic);
router.post('/certificate', upload.single('certificate'), uploadController.uploadCertificate);

module.exports = router;
