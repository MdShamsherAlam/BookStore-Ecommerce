
const Products = require("../models/product");
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
const fileHelper = require('../util/file')

exports.getAddProduct = (req, res, next) => {

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []

  });
};


exports.postAddProduct = (req, res, next) => {

  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  const errors = validationResult(req)
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: errors.array()                                         //this is for when i got error the border of the field must be red

    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        // imageUrl: imageUrl,                  this is for imageUrl
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: []                                        //this is for when i got error the border of the field must be red

    });


  }
  const imageUrl = image.path

  const product = new Products({
    // _id:new mongoose.Types.ObjectId('653bc8e9b2320a60a77f38b2'),                     //thrwoing error by duplicate id 
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user                                                   //here mongoose will automatically added id in userId                            
  });
  product.save()                                                                   //this save method comes from mongoose
    .then(result => {

      res.redirect('/')
      console.log("created Product")
    }).catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
}



exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Products.findById(prodId)
    .then(products => {
      if (!products) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: products,
        hasError: false,
        errorMessage: null,
        validationErrors: []

      });
    }).catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  // const updatedImg = req.body.imageUrl;
  const image = req.file
  const updatedDesc = req.body.description;
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()

    });
  }
  Products.findById(prodId).then(product => {
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/')
    }
    product.title = updatedTitle,
      product.price = updatedPrice,
      product.description = updatedDesc;
    if (image) {
      fileHelper.deleteFile(product.imageUrl)
      product.imageUrl = image.path;
    }
    return product.save().then(result => {
      console.log("updated Successfully")
      res.redirect('/admin/products')
    })

  })

    .catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
};

exports.getProducts = (req, res, next) => {
  Products.find({ userId: req.user._id })
    .then(products => {
      console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin-Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn

      })

    }).catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

}
exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Products.findById(prodId).then(product=>{ 
    if(!product){
      return next(new Error('Product not found'))
    }

    //for deleting image in file system 
    fileHelper.deleteFile(product.imageUrl)                                                       
     return Products.deleteOne({ _id: prodId, userId: req.user._id })
    })
    .then(result => {
      console.log("Deleted Successfully")
        res.status(200).json({message:'success!'})
    })
    .catch(err => {
      res.status(500).json({message:'Deleting Products failed'});
    })
    


}
