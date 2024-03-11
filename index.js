const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('connect to mongodDB'))
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));

const User = require('./models/user');

const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const authenticate = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/admin');
    }
    next();
};

app.get('/', (req, res) => {
    res.send('Home Page');
});

app.get('/admin', auth, (req, res, next) => {
    res.render('admin');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const {
        username,
        password
    } = req.body;
    const user = new User({
        username,
        password
    })
    await user.save();
    req.session.user = user.id;
    res.render('admin');
});

app.get('/login', authenticate, (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const {
        username,
        password
    } = req.body;
    const user = await User.findByCredentials(username, password);
    if (user) {
        req.session.user = user.id;
        res.redirect('/admin');
    } else {
        res.redirect('/login');
    }
})

app.post('/logout', auth, (req, res) => {
    //hanya menghapus spesifik data session
    // req.session.user = null;

    //menghapus semua data session
    req.session.destroy(() => {
        res.redirect('/login');
    })
})

app.listen(3000, () => {
    console.log('listening on http://localhost:3000');
})