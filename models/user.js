const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const userSchema=new mongoose.Schema({
 
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:String,
    resetTokenExpiration:Date,
    cart:{
        // items:[{productId:{type:Schema.Types.ObjectId ,required:true},             
        items:[{productId:{type:Schema.Types.ObjectId ,ref:'Product',required:true},        //here we set relation between product and cart and ref:'Product' is ./models/product inside Prduct Schema         
            quantity:{type:Number,required:true}}]
    }

    

})
userSchema.methods.addToCart=function(product){
    const cartProducIndex = this.cart.items.findIndex(cp => {
                    return cp.productId.toString() === product._id.toString()
                })
        
                let newQuantity = 1;
                const updatedCartItems = [...this.cart.items]
                if (cartProducIndex >= 0) {
                    newQuantity = this.cart.items[cartProducIndex].quantity + 1;
                    updatedCartItems[cartProducIndex].quantity = newQuantity;
                }
                else {
                    updatedCartItems.push({
                          productId: product._id
                        , quantity: newQuantity })
                }
        
        
                const updatedCart = { 
                 items: updatedCartItems
                 }
                this.cart=updatedCart;
                return this.save()
        


}
userSchema.methods.removeFromCart=function(productId){

                 const updatedCartItems = this.cart.items.filter(item => {
                   return item.productId.toString() !== productId.toString()
               });
               this.cart.items=updatedCartItems;
               return this.save();

}

userSchema.methods.clearCart=function(){
    this.cart={items:[]}
    return this.save();
}

module.exports=mongoose.model('User',userSchema);



















// const mongodb = require('mongodb')
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;
// class User {

//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;

//     }

//     save() {
//         const db = getDb()
//         return db.collection('users').insertOne(this)
//             .then(res => console.log(result))
//             .catch(err => console.log(err))
//     }

//     addToCart(product) {
//         const cartProducIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString()
//         })

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items]
//         if (cartProducIndex >= 0) {
//             newQuantity = this.cart.items[cartProducIndex].quantity + 1;
//             updatedCartItems[cartProducIndex].quantity = newQuantity;
//         }
//         else {
//             updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity })
//         }


//         const updatedCart = { items: updatedCartItems }
//         const db = getDb()
//         return db
//             .collection('users')
//             .updateOne({ _id: new ObjectId(this._id) },
//                 { $set: { cart: updatedCart } })

//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         })
//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } }).toArray()
//             .then(products => {
//                 return products.map(p => {
//                     return {
//                         ...p, quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString()
//                         })
//                     }
//                 })
//             }).catch()
//     }


//       deleteFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString()
//         });
//         const db = getDb()
//         console.log("Successfully deleted cart item")

//         return db
//             .collection('users')
//             .updateOne({ _id: new ObjectId(this._id) },
//             { $set: { cart: {items: updatedCartItems} } })

//         }

//         addOrder(){

//             const db=getDb();
//             const order={
//                 items:this.cart.items,
//                 user:{
//                     _id:new ObjectId(this._id),
//                     name:this.name
                    
//                 }
//             }
//             db.collection('orders').insertOne(this.cart).then(result=>{
//              this.cart={item:[]}
//               return db
//             .collection('users')
//             .updateOne({ _id: new ObjectId(this._id) },
//             { $set: { cart: {items: []} } })

//             })
//             .catch(err=>{
//                 console.log(err)
//             })
//         }


//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new ObjectId(userId) })
//             .then(user => {
//                 console.log(user)
//                 return user;
//             })
//             .catch(err => {
//                 console.log(err)
//             })

//     }
// }

// module.exports = User;