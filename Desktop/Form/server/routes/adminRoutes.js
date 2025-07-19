const express = require('express');
const Admin = require('../models/Admin')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken')



router.post('/login', async (req, res) => {
    console.log("LOGIN BODY", req.body);
    console.log("LOGIN BODY", req.body)
    const {email, password} = req.body;

    try {
        
        const admin = await Admin.findOne({email});
        if(!admin){
            return res.status(401).json({error: 'Invalid credential'});
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) 
            return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,  
            { expiresIn: '1h' }
        );

        res.status(201).json({message: 'Login successful', 
            token,
            admin: {name: admin.name, email: admin.email}
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({error : 'login failed'});
    }
});

router.get('/dashboard', verifyToken, async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id).select('-password');
      res.status(200).json({ message: 'Welcome to the dashboard', adminId: req.admin.id });
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ error: 'Failed to load dashboard' });
    }
  });

module.exports = router;