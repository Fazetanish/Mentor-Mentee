const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Project_Requests = new Schema({
    // References to users
    student_id: { type: ObjectId, ref: 'users', required: true },
    mentor_id: { type: ObjectId, ref: 'users', required: true },
    
    // Project Details (Step 2)
    projectTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    teamSize: { type: String, default: "1" },
    
    // Methodology & Tech Stack (Step 3)
    methodology: { type: String, required: true },
    techStack: [{ type: String }],
    
    // Goals & Timeline (Step 4)
    objectives: { type: String, required: true },
    expectedOutcome: { type: String, required: true },
    duration: { 
        type: String, 
        required: true, 
        enum: ["1-2 months", "3-4 months", "6 months", "1 year"] 
    },
    additionalNotes: { type: String },
    
    // Request Status
    status: { 
        type: String, 
        required: true, 
        enum: ["pending", "approved", "rejected", "changes_requested"], 
        default: "pending" 
    },
    
    // Mentor Response
    mentorFeedback: { type: String },
    respondedAt: { type: Date }

}, { timestamps: true });

// Index for faster queries
Project_Requests.index({ student_id: 1, status: 1 });
Project_Requests.index({ mentor_id: 1, status: 1 });

const Project_Request_Model = mongoose.model("project_requests", Project_Requests);

module.exports = {
    Project_Request_Model: Project_Request_Model
};