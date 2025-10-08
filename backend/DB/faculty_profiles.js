const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Faculty_Profiles = new Schema({
    user_id : {type:ObjectId , ref:'users' , required : true , unique : true},
    designation : {type:String , trim : true},
    capacity : {type:String , required : true , enum :["available" , "limited slots" ,"full"] , default : "available"},
    skills : [String],
    interest : [String]

} , {timestamps:true});

const Faculty_Profiles_Model = mongoose.model("faculty_profiles" , Faculty_Profiles);

module.exports =({
    Faculty_Profiles_Model : Faculty_Profiles_Model
})