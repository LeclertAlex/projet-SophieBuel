const db = require('./../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = db.users;

// Inscription (Signup)
exports.signup = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await Users.create({
            email: req.body.email,
            password: hashedPassword
        });
        res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};

// Connexion (Login)
exports.login = async (req, res) => {
    console.log('Email reçu : ', req.body.email);
    try {
        const user = await Users.findOne({ where: { email: req.body.email } });
        if (!user) {
            console.log('Email incorrect');
            return res.status(404).json({ error: 'email incorrect' });
        }
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            console.log('Mot de passe incorrect');
            return res.status(401).json({ error: 'password incorrect' });
        }
        const token = jwt.sign(
            { userId: user.id },
            process.env.TOKEN_SECRET,  // Assurez-vous que cette variable est définie dans .env
            { expiresIn: '24h' }
        );
        return res.status(200).json({
            userId: user.id,
            token
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};
