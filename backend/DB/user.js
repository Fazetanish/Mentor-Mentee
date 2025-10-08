const mongoose = require("mongoose")
const Schema = mongoose.Schema

const User = new Schema({
    name : String,
    email : { type:String , unique: true},
    password : String , 
    role : {type : String , required : true , enum : ["student" , "teacher"]}
} , {timestamps : true});

const UserModel = mongoose.model("users" , User);

module.exports = ({
    UserModel : UserModel
});