const mongodb=require('mongodb');
const MongoClient=mongodb.MongoClient

let _db;

const mongoConnect=callback=>{



MongoClient.connect('mongodb+srv://MdShamsher:R2BQhKtUA0nCfD4f@cluster0.nwebdck.mongodb.net/shop?retryWrites=true&w=majority')            //.connect method return promise
.then(client=>{
    _db=client.db()
    console.log("Connected! ")
    callback()
})
.catch(err=>{
    console.log(err)
    throw err;
})

}
const getDb=()=>{
    if(_db){
        return _db;
    }
    throw 'no database found'
}

// module.exports=mongoConnect;
exports.mongoConnect=mongoConnect;
exports.getDb=getDb;