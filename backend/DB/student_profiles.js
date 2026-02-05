const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Student_Profiles = new Schema({
    user_id: { type: ObjectId, required: true, ref: 'users', unique: true },
    registration_no: { type: String, required: true, unique: true, trim: true },
    year: { type: Number, required: true, min: 1, max: 5 },
    section: { type: String, trim: true },
    cgpa: { type: Number, min: 0, max: 10 },
    skills: [{ type: String, trim: true }],
    interest: [{ type: String, trim: true }],
    
    // Social Links (Optional)
    github: { 
        type: String, 
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty
                return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(v);
            },
            message: props => `${props.value} is not a valid GitHub URL!`
        }
    },
    linkedin: { 
        type: String, 
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty
                return /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/.test(v);
            },
            message: props => `${props.value} is not a valid LinkedIn URL!`
        }
    },
    
    // Optional: Portfolio or personal website
    portfolio: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty
                return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }
}, { timestamps: true });

const Student_Profile_Model = mongoose.model("student_profiles", Student_Profiles);

module.exports = {
    Student_Profile_Model: Student_Profile_Model
};