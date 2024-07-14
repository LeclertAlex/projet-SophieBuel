const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw new Error('No token provided');
        }

        console.log(req.headers.authorization); // Pour déboguer

        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        req.auth = { userId };

        if (req.body.userId && req.body.userId !== userId) {
            throw new Error('Invalid user ID');
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({
            error: error.message || 'You are not authenticated'
        });
    }
};