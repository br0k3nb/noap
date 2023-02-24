const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    jwt.sign(
        payload, 
        process.env.SECRET, 
        {algorithm: 'HS256'},
        (err, token) => {
        if (err) return `Invalid token: ${err}`
        else return token;
        }
    );
};


module.exports = generateToken; 