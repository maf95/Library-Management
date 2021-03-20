const bcrypt = require('bcryptjs');
//const { parse } = require('dotenv/types');
const session = require('express-session');
const User = require('../models/user')

exports.getIndex = (req, res, next) => {
    res.render("users/index", { pageTitle: "Welcome to Library" });
};

exports.getLogin = (req,res,next)=>{
    res.render('users/login',{pageTitle:"Login"})
}

exports.getAdmin = async (req,res,next)=>{
    const users = await User.find();
        
    res.render('users/admin',{pageTitle:"Admin's page",name:req.session.user.name,users:users})
}

exports.getLibrarian=(req,res,next)=>{
    res.render('users/librarian',{pageTitle:"Librarian's page"})
}

exports.getNewUser = (req,res,next)=>{
    res.render('users/new-user',{pageTitle:'Add new user'})
}

exports.getNewArticle=(req,res,next)=>{
    res.render('articles/new-article',{pageTitle:'Add new article'})
}

exports.getChangePassword=(req,res,next)=>{
    res.render('users/change-password',{pageTitle:"Change Password"})
}

exports.postNewUser=async (req,res,next)=>{
    try{
    const hashedPw = await bcrypt.hash(req.body.password,12);
    const user = new User({
        userName: req.body.username,
        name:req.body.name,
        
        password:hashedPw,
        role:req.body.position 
    })
    await user.save();
    console.log("User created")
    res.redirect('/admin')
    } catch(err){
        //handle errors
        console.log(err)
    }    
}

exports.postLogin=async (req,res,next)=>{
    try{
        const user = await User.findOne({userName:req.body.user})
        
    if(!user){
        return res.redirect('/authenticate')
        
    }
    const match =await bcrypt.compare(req.body.password, user.password)
    if(!match){
       return res.redirect('/authenticate')
         
     }
     req.session.user=user;
     req.session.isLoggedIn=true;
     console.log(req.session.user)
    if(user.firstLogin){
        return res.redirect('/change-password')
    }
   
    if(user.role==='admin'){
        return res.redirect('/admin')
    }
    if(user.role==='librarian'){
        return res.redirect('/librarian')
    }
    const error = new Error("Unknown error in authentication")
    throw error
    } catch(error){
        if(!error.statusCode){
            error.statusCode=500
        }
        next(error)
    }    
}

exports.postChangePassword = async (req,res,next)=>{
    try{
        const user = await User.findOne({userName : req.body.user})
    if(!user){
        return res.redirect('/change-password')
    }
    const match = await bcrypt.compare(req.body.password, user.password)
    if(!match){
        return res.redirect('/change-password')
    }
    if(req.body.passwordNew !==req.body.passwordConfirm){
        return res.redirect('/change-password')
    }
    const hashedPw= await bcrypt.hash(req.body.passwordNew,12)
    await User.findOneAndUpdate({userName:req.body.user},{password:hashedPw, firstLogin:false})
    if(user.role==='admin'){
        return res.redirect('/admin')
    }
    if(user.role==='librarian'){
        return res.redirect('/librarian')

    }
    const error = new Error("Unknown error during changing password")
    throw error;
    }catch(error){
        if(!error.statusCode){
            error.statusCode=500
        }
        next(error)
    }    
    
}

exports.postLogout=(req,res,next)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
}


