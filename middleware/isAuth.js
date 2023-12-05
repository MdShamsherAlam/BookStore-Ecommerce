module.exports=(req,res,next)=>{
      //user can use this when logged in
  if(!req.session.isLoggedIn){
    return res.redirect('/login')                

  }
  next()
}