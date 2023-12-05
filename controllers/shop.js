const fs = require('fs')
const path = require('path')
const e = require('express');
const Products = require('../models/product')
const mongoose = require('mongoose')
const Order = require('../models/order')
const PDFDocument = require('pdfkit')
const stripe=require('stripe')('sk_test_51O7uGwSJ5hDPKB6TIohzf94pXTZRe2AkV2zcnlAXKZWh1jUtNkZdCfuNqhk9ycA4ZBjuL64QAe3YIc4IE9HCJJJh00vkzEHwXZ')

const ITEMS_PER_PAGE=1;
exports.getProducts = (req, res, next) => {

  // Products.find().then(products => {                                       //in mongoose we have find()method that fetch all products in db
  //   res.render('shop/product-list', {
  //     prods: products,
  //     pageTitle: 'All-Products',
  //     path: '/products',
  //     isAuthenticated: req.session.isLoggedIn

  //   })

  // }).catch(err => {
  //   // res.redirect('/500')
  //   const error = new Error(err)
  //   error.httpStatusCode = 500;
  //   return next(error)
  // })
  const page=+req.query.page ||1 ;                 //we use plus to convert integer
  let totalItems;
  Products.find()
  .countDocuments()
  .then(numProducts=>{
    totalItems=numProducts;
    return Products.find().skip((page-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    
  }).then(products => 
    {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All-Products',
      path: '/products',
      csrfToken: req.csrfToken(),
      currentPage:page,
      hasNextPage:ITEMS_PER_PAGE *page < totalItems,
      hasPreviousPage:page>1,
      nextPage:page+1,
      previousPage:page-1,
      lastPage:Math.ceil(totalItems / ITEMS_PER_PAGE)
    })

  }).catch(err => {
    // res.redirect('/500')
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error)
  })

}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Products.findById(prodId)                                                     //findById is mongoose method that find products by id
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn

      })

    })

    .catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
}

exports.getIndex = (req, res, next) => {
  const page=+req.query.page ||1 ;                 //we use plus to convert integer
  let totalItems;
  Products.find()
  .countDocuments()
  .then(numProducts=>{
    totalItems=numProducts;
    return Products.find().skip((page-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    
  }).then(products => 
    {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      csrfToken: req.csrfToken(),
      currentPage:page,
      hasNextPage:ITEMS_PER_PAGE *page < totalItems,
      hasPreviousPage:page>1,
      nextPage:page+1,
      previousPage:page-1,
      lastPage:Math.ceil(totalItems / ITEMS_PER_PAGE)


    })

  }).catch(err => {
    // res.redirect('/500')
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error)
  })

}
  
  
 

  


exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {

      const products = user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn


      })

    })
    .catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
}

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId')
    .then(user => {
      products = user.cart.items;
      total = 0;

      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });

      const lineItems = products.map(p => {
        return {
          price_data: {
            currency: 'inr',
            product_data: {
              name: p.productId.title,
              description: p.productId.description,
            },
            unit_amount: p.productId.price * 100,
          },
          quantity: p.quantity,
        };
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }
      })
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products

      });
      return order.save()
    })
    .then(result => {
      req.user.clearCart();


    })
    .then(() => {
      res.redirect('/orders')

    })
    .catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

}


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Products.findById(prodId).then(product => {
    return req.user.addToCart(product);
  })
    .then(result => {
      console.log(result)
      res.redirect('/cart')

    })
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

}

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id }).then(orders => {
    res.render('shop/order', {
      path: '/order',
      pageTitle: 'Your Orders',
      orders: orders,
      isAuthenticated: req.session.isLoggedIn
    })
  })
    .catch(err => {
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
}
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName)
      const pdfDoc = new PDFDocument();
      const file = fs.createReadStream(invoicePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res)

      // pdfDoc.text('This is Dummy');
      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      })
      pdfDoc.text('----------------------------------------')    //for new line
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice = totalPrice + prod.quantity * prod.product.price
        pdfDoc.text(
          prod.product.title + '-' + prod.quantity + '-' + 'Price $'+ prod.product.price
        )
      })
      pdfDoc.text('Total Price: $' + totalPrice)
      
      pdfDoc.end();

    })
    .catch(err => {
      return next(err)
    })

}



