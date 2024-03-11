const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'nama harus di isi!']
    },
    password: {
        type: String,
        required: [true, 'password harus di isi!']
    }
});

userSchema.statics.findByCredentials = async function (username, password) {
    const user = await this.findOne({
        username
    });
    const isMatch = bcrypt.compare(password, user.password);
    return isMatch ? user : false;
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
})

module.exports = mongoose.model('User', userSchema);