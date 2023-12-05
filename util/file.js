const fs=require('fs')
    //for deleting image in file system 

const deleteFile=(filePath)=>{
    fs.unlink(filePath,(err)=>{
        if(err){
            throw (err);
        }
    })
}
exports.deleteFile=deleteFile;