const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    categories: { type: [String], default: []},
    studyTimes: [{
        date: { type: Date },
        seconds: { type: Number },
        category: {type: String},
    }],
    coins: { type: Number, default: 0 },
    unlockedBadges: { type: [Number], default: [] },
    durations: {
        pomodoro: { type: Number, default: 25 },
        shortBreak: { type: Number, default: 5 },
        longBreak: { type: Number, default: 15 },
        cyclesBeforeLongBreak: { type: Number, default: 3 }
    }
});


userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, { expiresIn: '7d' });
    return token;
};

const User = mongoose.model('user', userSchema);

const validate = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required().label('First Name'),
        lastName: Joi.string().required().label('Last Name'),
        email: Joi.string().email().required().label('Email'),
        password: passwordComplexity().required().label('Password'),
    });
    return schema.validate(data);
};

module.exports = { User, validate };
