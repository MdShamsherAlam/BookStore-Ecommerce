const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const productSchema=new Schema({
    title:{
        type:String,
        required:true
    }
    ,
    price:{
        type:Number,
        required:true

    },
    description:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId, 
        ref:'User'                                //here we set relation between userId and cart and ref:'Product' is ./models/user inside User Schema         
        ,required:true
    }



})

module.exports=mongoose.model('Product',productSchema)












// const mongodb = require('mongodb')                                                                       //we are importing for id purpose because we can't match id in mongo db id is in the form of object
// const getDb = require('../util/database').getDb
// class Product {
//     constructor(title, price, imageUrl, description, id,userId) {                                                     //for updating we adding optional id that means it is only for update because when we want to update we have to check konsi product ko update karna hai by the help of id
//         this.title = title,
//             this.price = price,
//             this.imageUrl = imageUrl,
//             this.description = description,
//             // this._id =  new mongodb.ObjectId(id)                      //for getting user id in mongo                                     
//             this._id =  id? new mongodb.ObjectId(id):null;               //Here i added ternary operator that if id is available don't add id otherwise store null                                                   
//             this.userId=userId;                                        


//     }
//     save() {
//         const db = getDb();
//         let dbOp;
//         if (this._id) {
//             // Update the product
//             dbOp = db.collection('products')
//               .updateOne({ _id:this._id }, { $set: this })
//             console.log("Success")
//           }          
//         else {
//             dbOp = db.collection('products').insertOne(this)
//         }
//         return dbOp.then(result => {
//             console.log(result)
//         })
//             .catch(err => {
//                 console.log(err)
//             });
//     }
//     static fetchAll() {
//         const db = getDb();                                                 //for connect with database we added this
//         return db.collection('products').find().toArray()                 //db.collection means we connect with collection and it return promise 
//             .then(products => {
//                 console.log(products)
//                 return products;
//             })
//             .catch(err => console.log(err))
//     }

//     static findById(prodId) {
//         const db = getDb();
//         return db.collection('products')
//             // .find({_id:prodId})                                       //this is not working because in mongodb id is in the form of object so we can't compare directly 
//             .find({ _id: new mongodb.ObjectId(prodId) })
//             .next()
//             .then(product => {
//                 console.log(product)
//                 return product;
//             })
//             .catch(err => {
//                 console.log(err)
//             })
//     }

//     static deleteById(prodId) {
//         const db = getDb();
//         return db.collection('products').deleteOne({_id:new mongodb.ObjectId(prodId)})
//         .then(result=>{
//          console.log("Deleted Successfully!")
//         })
//         .catch(err=>console.log(err))
            
           

//     }

// }


// module.exports = Product;