const mongoose = require('mongoose')
const Schema = mongoose.Schema

const historySchema = new Schema({
    lentArticle:{
        type:Schema.Types.ObjectId,
        ref:"Article"
    },
    personName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    dateLent:{
        type:Date,
        default:Date.now
    },
    setReturnDate:{
        type:Date,
        default: () => Date.now() + 7*24*60*60*1000
    },
    returnDate:Date
})

module.exports=mongoose.model("History", historySchema)