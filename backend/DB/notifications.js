const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const NotificationSchema = new Schema({
    user_id: { type: ObjectId, required: true, ref: 'users', index: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['request_approved', 'request_rejected', 'request_changes', 'general']
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    data: {
        request_id: { type: ObjectId, ref: 'project_requests' },
        mentor_name: { type: String },
        project_title: { type: String },
        feedback: { type: String }
    }
}, { timestamps: true });

// Index for faster queries
NotificationSchema.index({ user_id: 1, read: 1, createdAt: -1 });

const NotificationModel = mongoose.model("notifications", NotificationSchema);

module.exports = {
    NotificationModel
};