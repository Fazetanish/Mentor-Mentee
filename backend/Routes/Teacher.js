const express = require("express");
const { Router } = require("express");
const TeacherRouter = Router();
const { UserModel } = require("../DB/user");
const { Faculty_Profiles_Model } = require("../DB/faculty_profiles");

require("dotenv").config();
const mongoose = require("mongoose");
const { default: z } = require("zod");
const { authJWTMiddleware } = require("../Middlewares/authJWT");

TeacherRouter.use(express.json());

// Create Teacher Profile
TeacherRouter.post("/profile", authJWTMiddleware, async function(req, res) {
    const requiredBody = z.object({
        designation: z.string().trim().optional(),
        capacity: z.enum(["available", "limited slots", "full"]).default("available"),
        skills: z.array(z.string()).optional().default([]),
        interest: z.array(z.string()).optional().default([])
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedBody.error.issues
        });
    }

    // Verify user is a teacher
    if (req.user.role !== "teacher") {
        return res.status(403).json({
            message: "Only teachers can create teacher profiles"
        });
    }

    const { designation, capacity, skills, interest } = parsedBody.data;

    try {
        // Check if profile already exists
        const existingProfile = await Faculty_Profiles_Model.findOne({ 
            user_id: req.user.id 
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Profile already exists for this user"
            });
        }

        await Faculty_Profiles_Model.create({
            user_id: req.user.id,
            designation: designation,
            capacity: capacity,
            skills: skills,
            interest: interest
        });

        return res.status(201).json({
            message: "Teacher profile created successfully"
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Teacher profile already exists"
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get Teacher Profile (own profile)
TeacherRouter.get("/profile", authJWTMiddleware, async function(req, res) {
    if (req.user.role !== "teacher") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try {
        const profile = await Faculty_Profiles_Model.findOne({ user_id: req.user.id })
            .populate('user_id', 'name email');

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            profile: profile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Update Teacher Profile
TeacherRouter.patch("/profile", authJWTMiddleware, async function(req, res) {
    const requiredBody = z.object({
        designation: z.string().trim().optional(),
        capacity: z.enum(["available", "limited slots", "full"]).optional(),
        skills: z.array(z.string()).optional(),
        interest: z.array(z.string()).optional()
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedBody.error.issues
        });
    }

    // Verify user is a teacher
    if (req.user.role !== "teacher") {
        return res.status(403).json({
            message: "Only teachers can update teacher profiles"
        });
    }

    try {
        const profile = await Faculty_Profiles_Model.findOne({ user_id: req.user.id });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        const { designation, capacity, skills, interest } = parsedBody.data;

        // Update only provided fields
        if (designation !== undefined) profile.designation = designation;
        if (capacity !== undefined) profile.capacity = capacity;
        if (skills !== undefined) profile.skills = skills;
        if (interest !== undefined) profile.interest = interest;

        await profile.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: profile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get all available teachers/mentors (for students to browse)
TeacherRouter.get("/mentors", authJWTMiddleware, async function(req, res) {
    try {
        const { capacity, skill } = req.query;

        let filter = {};
        
        // Filter by capacity if provided
        if (capacity && ["available", "limited slots", "full"].includes(capacity)) {
            filter.capacity = capacity;
        }

        const mentors = await Faculty_Profiles_Model.find(filter)
            .populate('user_id', 'name email')
            .sort({ createdAt: -1 });

        // Filter by skill if provided (case-insensitive)
        let filteredMentors = mentors;
        if (skill) {
            filteredMentors = mentors.filter(mentor => 
                mentor.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
                mentor.interest.some(i => i.toLowerCase().includes(skill.toLowerCase()))
            );
        }

        return res.status(200).json({
            message: "Mentors fetched successfully",
            mentors: filteredMentors
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get a specific teacher profile by ID (public view)
TeacherRouter.get("/profile/:teacherId", authJWTMiddleware, async function(req, res) {
    const { teacherId } = req.params;

    try {
        const profile = await Faculty_Profiles_Model.findOne({ user_id: teacherId })
            .populate('user_id', 'name email');

        if (!profile) {
            return res.status(404).json({
                message: "Teacher profile not found"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            profile: profile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

module.exports = {
    TeacherRouter: TeacherRouter
};