exports.isAdmin = (req,res,next)=>{
     if(!(req.session.isLoggedIn && (req.session.user.role==='admin'))){
          return res.redirect('/authenticate')
         } 
         next()
        }