const express = require("express");
const path = require("path");
const isAuth=require('../middleware/isAuth')

const router = express.Router();
const rootDir = require("../util/path");

const {body}=require('express-validator')

const adminController=require('../controllers/admin')
router.get("/add-product", isAuth,adminController.getAddProduct)

// //admin get==>products
router.get("/products", isAuth,adminController.getProducts)

router.post("/add-product",[
    body('title').isString().isLength({min:3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min:5,max:400}).trim(),


    

],


isAuth, adminController.postAddProduct)

router.get('/edit-product/:productId', isAuth,adminController.getEditProduct)
router.post('/edit-product',[
    body('title').isString().isLength({min:3}).trim(),
    // body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').isLength({min:5,max:400}).trim(),


    

],isAuth,adminController.postEditProduct) ;

// router.post('/delete-product',isAuth,adminController.postDeleteProduct)
router.delete('/product/:productId',isAuth,adminController.deleteProduct)


module.exports=router;
