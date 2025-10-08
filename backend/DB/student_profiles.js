const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Student_Profiles = new Schema({
    user_id :{type:ObjectId , required : true , ref : 'users' , unique:true} , 
    registration_no : {type:String , required:true , unique : true , trim:true},
    year : {type : Number , required : true , min:1 , max:5},
    section :{type : String},
    cgpa : {type : Number},
    skills : [String],
    interest : [String]
} , {timestamps:true});

const Student_Profile_Model = mongoose.model("student_profiles" , Student_Profiles);

module.exports = ({
    Student_Profile_Model : Student_Profile_Model
});