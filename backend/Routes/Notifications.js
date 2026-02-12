const express = require("express");
const { Router } = require("express");
const NotificationRouter = Router();
const { NotificationModel } = require("../DB/notifications");
const { authJWTMiddleware } = require("../Middlewares/authJWT");
const { z } = require("zod");

NotificationRouter.use(express.json());

// Get all notifications for the logged-in user
NotificationRouter.get("/", authJWTMiddleware, async function(req, res) {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        const query = { user_id: req.user.id };
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await NotificationModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await NotificationModel.countDocuments(query);
        const unreadCount = await NotificationModel.countDocuments({ 
            user_id: req.user.id, 
            read: false 
        });

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications,
            unreadCount,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get unread notification count
NotificationRouter.get("/unread-count", authJWTMiddleware, async function(req, res) {
    try {
        const unreadCount = await NotificationModel.countDocuments({ 
            user_id: req.user.id, 
            read: false 
        });

        return res.status(200).json({
            message: "Unread count fetched successfully",
            unreadCount
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Mark a single notification as read
NotificationRouter.patch("/:notificationId/read", authJWTMiddleware, async function(req, res) {
    try {
        const { notificationId } = req.params;

        const notification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, user_id: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Mark all notifications as read
NotificationRouter.patch("/mark-all-read", authJWTMiddleware, async function(req, res) {
    try {
        await NotificationModel.updateMany(
            { user_id: req.user.id, read: false },
            { read: true }
        );

        return res.status(200).json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Delete a notification
NotificationRouter.delete("/:notificationId", authJWTMiddleware, async function(req, res) {
    try {
        const { notificationId } = req.params;

        const notification = await NotificationModel.findOneAndDelete({
            _id: notificationId,
            user_id: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Delete all read notifications
NotificationRouter.delete("/clear/read", authJWTMiddleware, async function(req, res) {
    try {
        await NotificationModel.deleteMany({
            user_id: req.user.id,
            read: true
        });

        return res.status(200).json({
            message: "All read notifications cleared"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

module.exports = { NotificationRouter };