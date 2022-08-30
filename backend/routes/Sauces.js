const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const SaucesCtrl = require('../controllers/Sauces');

router.get('/', auth, SaucesCtrl.getAllSauces);
router.post('/', auth, multer, SaucesCtrl.createSauces);
router.get('/:id', auth, SaucesCtrl.getOneSauces);
router.put('/:id', auth, multer, SaucesCtrl.modifySauces);
router.delete('/:id', auth, SaucesCtrl.deleteSauces);
router.post('/:id/like', auth, SaucesCtrl.likeASauces);



module.exports = router;

