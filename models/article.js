const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    typeOfArticle:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    isStolen:{
        type:Boolean,
        default:false
    },
    isDestroyed:{
        type:Boolean,
        default:false
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    lentingHistory:[{
        type:Schema.Types.ObjectId,
        ref:"History"
    }]
})

module.exports=mongoose.model("Article", articleSchema)