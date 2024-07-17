// const express = require('express');
// const router = express.Router();
// const userCtrl = require('../controllers/users.controller');

// router.post('/login', userCtrl.login);
// //router.post('/signup', userCtrl.signup);

// module.exports = router;


//teste routes securiser //
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/users.controller');
const auth = require('../middlewares/auth');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// Exemple de route protégée
router.get('/profile', auth, (req, res) => {
    res.status(200).json({ message: 'Profile access granted', userId: req.auth.userId });
});

module.exports = router;