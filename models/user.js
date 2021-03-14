const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    name :{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false  
    },
    isLibrarian:{
        type:Boolean,
        defaultfalse
    },
    firstLogin:{
        type:Boolean,
        default:true
    }

})

module.exports=mongoose.model("User",userSchema)