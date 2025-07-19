const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const playerRoutes = require('./routes/playerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');
require('dotenv').config();


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/player', playerRoutes);
app.use('/api/admin', adminRoutes);


mongoose.connect(process.env.MONGO_URL)
.then(async () => {
    console.log('MongoDB Connected');
    const defaultEmail = 'admin@example.com';
    const defaultPassword = 'admin123';
    const defaultName = 'Super Admin';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const existing = await Admin.findOne({ email: defaultEmail });
    if (!existing) {
        await Admin.create({ name: defaultName, email: defaultEmail, password: hashedPassword });
        console.log(' Default admin created:', { email: defaultEmail, password: defaultPassword });
    } else {
        // Always update password to default
        existing.password = hashedPassword;
        existing.name = defaultName;
        await existing.save();
        console.log('Default admin password reset:', { email: defaultEmail, password: defaultPassword });
    }
}).catch((err) => {
    console.error('DB connection error', err);
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})