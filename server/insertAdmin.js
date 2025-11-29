const mongoose = require('mongoose');
const Admin = require('./models/admin');

const uri = 'mongodb+srv://aaamirkhan917:Mohd%40aamir12@onesport.njlv6n1.mongodb.net/yourdbname?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'admin123'
    });
    await admin.save();
    console.log('Admin created successfully!');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
