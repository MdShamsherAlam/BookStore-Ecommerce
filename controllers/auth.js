const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { validationResult } = require('express-validator')



const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mdshamsher8431@gmail.com',
        pass: 'ompptsxszvpnnmxb',
    },
});
exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    }
    else {
        message = null;
    }


    res.render('auth/login', {
        path: '/login',
        pageTitle: 'login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []




    })

}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'login',
                    errorMessage: 'Invalid email or password',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                })
            }
            bcrypt.compare(password, user.password)
                .then(domatch => {
                    if (domatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/')

                        });
                    }
                    req.flash('error', 'Invalid email or password');
                    res.redirect('/login')
                })
                .catch(err => {
                    console.log(err)
                })

        })
        .catch(err => {
            // res.redirect('/500')
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
}
//for signup

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    }
    else {
        message = null;
    }
    res.render('signup/signup', {
        path: '/signup',
        pageTitle: 'Signup page',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []

    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('signup/signup', {
            path: '/signup',
            pageTitle: 'Signup page',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        })
            ;
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            })
            return user.save();
        })
        .then(result => {
            res.redirect('/login')
            const mailOptions = {
                from: 'mdshamsher8431@gmail.com',
                to: email,
                subject: 'Welcome to Hulk Baba Store',
                text: 'Thank you for signing up with Hulk Baba Store. We are excited to have you on board!',
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email: ' + error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        })
        .catch(err => {
            // res.redirect('/500')
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
        })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    }
    else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
}
//this is for reset password so we have crypto method inbuilt in nodejs app to verify that user is correct or not
exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found')
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/')
                const mailOptions = {
                    from: 'mdshamsher8431@gmail.com',
                    to: req.body.email,
                    subject: 'Password Reset',
                    html: `
                 <p>You requested a password reset</p>
                 <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set new password</p>
                 `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending email: ' + error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

            })
            .catch(err => {
                // res.redirect('/500')
                const error = new Error(err)
                error.httpStatusCode = 500;
                return next(error)
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0]
            }
            else {
                message = null;
            }
            res.render('auth/newpassword', {
                path: '/new-password',
                pageTitle: 'New-Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token

            })

        })

        .catch(err => console.log(err))


}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = undefined;
            resetUser.save()

        }).then(result => {
            res.redirect('/login')
        })
        .catch(err => {
            // res.redirect('/500')
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
        })

}