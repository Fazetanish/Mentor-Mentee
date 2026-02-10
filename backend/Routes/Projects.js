const express = require("express");
const { Router } = require("express");
const ProjectRouter = Router();
const { UserModel } = require("../DB/user");
const { Project_Request_Model } = require("../DB/project_requests");

require("dotenv").config();
const mongoose = require("mongoose");
const { default: z } = require("zod");
const { authJWTMiddleware } = require("../Middlewares/authJWT");

ProjectRouter.use(express.json());

// Create a new project request (Student submits to Mentor)
ProjectRouter.post("/request", authJWTMiddleware, async function(req, res) {
    const requiredBody = z.object({
        mentor_id: z.string().min(1, "Mentor ID is required"),
        projectTitle: z.string().min(1, "Project title is required").trim(),
        description: z.string().min(50, "Description must be at least 50 words"),
        teamSize: z.string().default("1"),
        methodology: z.string().min(30, "Methodology must be at least 30 words"),
        techStack: z.array(z.string()).min(1, "At least one technology is required"),
        objectives: z.string().min(20, "Objectives must be at least 20 words"),
        expectedOutcome: z.string().min(20, "Expected outcome must be at least 20 words"),
        duration: z.enum(["1-2 months", "3-4 months", "6 months", "1 year"]),
        additionalNotes: z.string().optional()
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedBody.error.issues
        });
    }

    // Verify user is a student
    if (req.user.role !== "student") {
        return res.status(403).json({
            message: "Only students can submit project requests"
        });
    }

    const { 
        mentor_id, projectTitle, description, teamSize, 
        methodology, techStack, objectives, expectedOutcome, 
        duration, additionalNotes 
    } = parsedBody.data;

    try {
        // Verify mentor exists and is a teacher
        const mentor = await UserModel.findById(mentor_id);
        if (!mentor || mentor.role !== "teacher") {
            return res.status(404).json({
                message: "Mentor not found or invalid"
            });
        }

        // Check for existing pending request to the same mentor
        const existingRequest = await Project_Request_Model.findOne({
            student_id: req.user.id,
            mentor_id: mentor_id,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You already have a pending request with this mentor"
            });
        }

        const newRequest = await Project_Request_Model.create({
            student_id: req.user.id,
            mentor_id: mentor_id,
            projectTitle: projectTitle,
            description: description,
            teamSize: teamSize,
            methodology: methodology,
            techStack: techStack,
            objectives: objectives,
            expectedOutcome: expectedOutcome,
            duration: duration,
            additionalNotes: additionalNotes,
            status: "pending"
        });

        return res.status(201).json({
            message: "Project request submitted successfully",
            requestId: newRequest._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get all project requests for a student
ProjectRouter.get("/requests/student", authJWTMiddleware, async function(req, res) {
    if (req.user.role !== "student") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try {
        const requests = await Project_Request_Model.find({ student_id: req.user.id })
            .populate('mentor_id', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Requests fetched successfully",
            requests: requests
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get all project requests for a mentor
ProjectRouter.get("/requests/mentor", authJWTMiddleware, async function(req, res) {
    if (req.user.role !== "teacher") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try {
        const requests = await Project_Request_Model.find({ mentor_id: req.user.id })
            .populate('student_id', 'name email')
            .sort({ createdAt: -1 });

        // Fetch student profile data for each request
        const { Student_Profile_Model } = require("../DB/student_profiles");
        
        const requestsWithProfiles = await Promise.all(
            requests.map(async (request) => {
                const requestObj = request.toObject();
                
                // Fetch student profile
                if (request.student_id?._id) {
                    const studentProfile = await Student_Profile_Model.findOne({ 
                        user_id: request.student_id._id 
                    });
                    
                    if (studentProfile) {
                        requestObj.studentRegNo = studentProfile.registration_no;
                        requestObj.studentYear = studentProfile.year;
                        requestObj.studentSemester = studentProfile.semester; // Include semester too
                        requestObj.studentCgpa = studentProfile.cgpa;
                        requestObj.studentSkills = studentProfile.skills || [];
                        requestObj.studentInterests = studentProfile.interest || [];
                        requestObj.studentGithub = studentProfile.github || '';
                        requestObj.studentSection = studentProfile.section || '';
                    }
                }
                
                return requestObj;
            })
        );

        return res.status(200).json({
            message: "Requests fetched successfully",
            requests: requestsWithProfiles
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Mentor responds to a project request (approve/reject/request changes)
ProjectRouter.patch("/request/:requestId", authJWTMiddleware, async function(req, res) {
    const requiredBody = z.object({
        status: z.enum(["approved", "rejected", "changes_requested"]),
        mentorFeedback: z.string().optional()
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
            message: "Only mentors can respond to project requests"
        });
    }

    const { requestId } = req.params;
    const { status, mentorFeedback } = parsedBody.data;

    try {
        const request = await Project_Request_Model.findOne({
            _id: requestId,
            mentor_id: req.user.id
        });

        if (!request) {
            return res.status(404).json({
                message: "Request not found or you don't have permission"
            });
        }

        request.status = status;
        request.mentorFeedback = mentorFeedback || "";
        request.respondedAt = new Date();
        await request.save();

        return res.status(200).json({
            message: `Request ${status} successfully`,
            request: request
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get a single project request by ID
ProjectRouter.get("/request/:requestId", authJWTMiddleware, async function(req, res) {
    const { requestId } = req.params;

    try {
        const request = await Project_Request_Model.findById(requestId)
            .populate('student_id', 'name email')
            .populate('mentor_id', 'name email');

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // Verify user has access (either the student or mentor)
        if (request.student_id._id.toString() !== req.user.id && 
            request.mentor_id._id.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        return res.status(200).json({
            message: "Request fetched successfully",
            request: request
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
    ProjectRouter: ProjectRouter
};