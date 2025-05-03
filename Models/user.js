// models/user.js
import mongoose from 'mongoose';

// Create a Schema for the User
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Simple email validation
  },
  password: {
    type: String,
    required: true,
  },
  city:{
    type:String,
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Automatically set the date when the user is created
  },
});

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

export default User;
