const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/users.controller'); // Vérifiez le chemin du contrôleur

// Route pour l'inscription
router.post('/signup', userCtrl.signup);

// Route pour la connexion
router.post('/login', userCtrl.login);

module.exports = router;