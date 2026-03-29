const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Sign user token
 */
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d'
    });
};

/**
 * Signup
 */
exports.signup = async (req, res) => {
    let { name, email, password, role } = req.body;
    email = email.toLowerCase();
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        
        const token = signToken(user._id);
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Login
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = signToken(user._id);
        
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
