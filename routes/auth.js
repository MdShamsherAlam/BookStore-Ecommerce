const express=require('express')
const router=express.Router();
const User=require('../models/user')
const {check,body}=require('express-validator')  
               //it gives me object so we have to destructing which data we need

const authController=require('../controllers/auth')

router.get('/login',authController.getLogin)

router.post('/login',[check('email').isEmail()
.withMessage('please enter a valid email')
.normalizeEmail()
,body('password','password has to be valid')
.isLength({min:5})
.isAlphanumeric()
.trim(),
authController.postLogin])
router.post('/logout',authController.postLogout)

//for signup

router.get('/signup',authController.getSignup)
router.post('/signup',
[check('email').isEmail()
.withMessage('please enter a valid email')
.custom((value,{req})=>{
    // if(value==='shamsher@gmail.com'){
    //     throw new Error('This email address is forbidden');
    // }
    // return true;
   return User.findOne({ email: value })
    .then(userDoc => {
        if (userDoc) {
            return Promise.reject('Email exist already please pick other one')
          
        }})
        
}).normalizeEmail()
,body('password','please enter a password with only numbers and text and atleast 5 characters')
.isLength({min:5})
.isAlphanumeric()
.trim(),
body('confirmPassword').trim().custom((value,{req})=>{
    if(value!==req.body.password){
        throw new Error("Passwords have to match")
    }  
    return true;

})
,authController.postSignup])                             //check('email ) is form email that is decleared in signup form
router.get('/reset',authController.getReset)
router.post('/reset',authController.postReset)
router.get('/reset/:token',authController.getNewPassword)
router.post('/new-password',authController.postNewPassword)




module.exports=router;