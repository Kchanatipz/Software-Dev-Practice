const mongoose = require('mongooese');

const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true,'Please add a name']
    },
    email : {
        type: String,
        required: [true,'Please add an email'],
        unique: true,
        match: [/^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\. [a-zA-Z]{2,4}$/,'Please add a valid email']
    },
    role : {
        type:String,
        enum: ['user','admin'],
        default: 'user'
    },
    password : {
        type: String,
        required: [true,'Please add a password'],
        minlength: 8,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt : {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User',UserSchema);