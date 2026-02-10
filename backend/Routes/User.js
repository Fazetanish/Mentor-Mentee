require("dotenv").config();

const express = require("express");
const { Router } = require("express");
const UserRouter = Router();
const { UserModel } = require("../DB/user");
const { Student_Profile_Model } = require("../DB/student_profiles");
const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { default: z, email } = require("zod");
const bcrypt = require("bcrypt");
const { authJWTMiddleware } = require("../Middlewares/authJWT");

const JWT_Secret_User = process.env.JWT_Secret_User;

mongoose.connect(process.env.Mongo_URL);

UserRouter.use(express.json());

// Debug: Check if env variables are loaded (remove after testing)
console.log("EMAIL_USER loaded:", process.env.EMAIL_USER ? "Yes" : "No");
console.log("EMAIL_PASS loaded:", process.env.EMAIL_PASS ? "Yes" : "No");

// In-memory OTP store
const otpStore = new Map();

// ✅ CHANGE THIS: Email transporter configuration for GMAIL
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Changed from Office365 to Gmail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("Email transporter error:", error);
    } else {
        console.log("✅ Email server is ready to send messages");
    }
});

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to validate URLs
const githubUrlRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
const linkedinUrlRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/;
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// Send OTP endpoint
UserRouter.post("/send-otp", async function(req, res) {
    const requiredBody = z.object({
        email: z.string().email("Invalid email format").refine(
            (email) =>
                email.endsWith("@muj.manipal.edu") ||
                email.endsWith("@jaipur.manipal.edu"),
            "Email must be a valid Manipal University address"
        )
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid email",
            error: parsedBody.error.issues
        });
    }

    const { email } = parsedBody.data;

    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        const otp = generateOTP();
        
        // Store OTP with expiry (5 minutes)
        otpStore.set(email, {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP - Mentor-Mentee Platform',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4F46E5; margin: 0;">Mentor-Mentee Platform</h1>
                        <p style="color: #6B7280; margin-top: 5px;">Manipal University</p>
                    </div>
                    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 12px; text-align: center;">
                        <h2 style="color: white; margin: 0 0 10px 0;">Email Verification</h2>
                        <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0;">Your OTP for email verification is:</p>
                        <div style="background: white; padding: 15px 30px; border-radius: 8px; display: inline-block;">
                            <span style="color: #4F46E5; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
                        </div>
                        <p style="color: rgba(255,255,255,0.8); margin-top: 20px; font-size: 14px;">This OTP will expire in 5 minutes.</p>
                    </div>
                    <p style="color: #6B7280; text-align: center; margin-top: 20px; font-size: 13px;">
                        If you didn't request this verification, please ignore this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }
});

// Verify OTP endpoint
UserRouter.post("/verify-otp", async function(req, res) {
    const requiredBody = z.object({
        email: z.string().email("Invalid email format"),
        otp: z.string().length(6, "OTP must be 6 digits")
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedBody.error.issues
        });
    }

    const { email, otp } = parsedBody.data;

    try {
        const storedOtpData = otpStore.get(email);

        if (!storedOtpData) {
            return res.status(400).json({
                message: "OTP not found. Please request a new OTP."
            });
        }

        if (Date.now() > storedOtpData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (storedOtpData.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // OTP verified successfully - remove from store
        otpStore.delete(email);

        return res.status(200).json({
            message: "Email verified successfully",
            verified: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Verification failed",
            error: error.message
        });
    }
});

// Existing signup route
UserRouter.post("/signup", async function(req, res) {
    const requiredBody = z.object({
        name: z.string().min(2).max(50),
        email: z.string().email("Invalid email format").refine(
            (email) =>
                email.endsWith("@muj.manipal.edu") ||
                email.endsWith("@jaipur.manipal.edu"),
            "Email must be a valid Manipal University address"
        ),
        role: z.enum(["student", "teacher"]),
        password: z.string().min(8).max(100)
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid Credentials",
            error: parsedBody.error.issues
        });
    }

    const { name, email, role, password } = parsedBody.data;

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            name: name,
            password: hashedPassword,
            role: role,
            email: email
        });

        return res.status(201).json({
            message: "User successfully signed up"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

UserRouter.post("/signup", async function(req, res) {
    const requiredBody = z.object({
        name: z.string().min(2).max(50),
        email: z.string().email("Invalid email format").refine(
            (email) =>
                email.endsWith("@muj.manipal.edu") ||
                email.endsWith("@jaipur.manipal.edu"),
            "Email must be a valid Manipal University address"
        ),
        role: z.enum(["student", "teacher"]),
        password: z.string().min(8).max(100)
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid Credentials",
            error: parsedBody.error.issues
        });
    }

    const { name, email, role, password } = parsedBody.data;

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            name: name,
            password: hashedPassword,
            role: role,
            email: email
        });

        return res.status(201).json({
            message: "User successfully signed up"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

UserRouter.post("/signin", async function(req, res) {
    const requiredBody = z.object({
        email: z.string().email("Invalid email format").refine(
            (email) =>
                email.endsWith("@muj.manipal.edu") ||
                email.endsWith("@jaipur.manipal.edu"),
            "Email must be a valid Manipal University address"
        ),
        password: z.string().min(8).max(100),
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Error in credentials",
            error: parsedBody.error.issues
        });
    }

    const { email, password } = parsedBody.data;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        const token = jwt.sign({
            email: email,
            id: user._id,
            role: user.role
        }, JWT_Secret_User);

        return res.status(200).json({
            message: "User signin successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
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

// Create Student Profile
UserRouter.post("/student/profile", authJWTMiddleware, async function(req, res) {
    const requiredBody = z.object({
        registration_no: z.string().min(1, "Registration number is required").trim(),
        year: z.number().min(1).max(5),
        semester: z.number().min(1).max(10), // NEW: Required semester field
        section: z.string().optional(),
        cgpa: z.number().min(0).max(10).optional(),
        skills: z.array(z.string()).optional().default([]),
        interest: z.array(z.string()).optional().default([]),
        github: z.string().optional().refine(
            (val) => !val || githubUrlRegex.test(val),
            "Invalid GitHub URL format. Use: https://github.com/username"
        ),
        linkedin: z.string().optional().refine(
            (val) => !val || linkedinUrlRegex.test(val),
            "Invalid LinkedIn URL format. Use: https://linkedin.com/in/username"
        ),
        portfolio: z.string().optional().refine(
            (val) => !val || urlRegex.test(val),
            "Invalid portfolio URL format"
        )
    });

    const parsedBody = requiredBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: parsedBody.error.issues
        });
    }

    const { 
        registration_no, year, semester, section, cgpa, // Added semester
        skills, interest, github, linkedin, portfolio 
    } = parsedBody.data;

    // Verify user is a student
    if (req.user.role !== "student") {
        return res.status(403).json({
            message: "Only students can create student profiles"
        });
    }

    try {
        // Check if profile already exists
        const existingProfile = await Student_Profile_Model.findOne({
            $or: [
                { user_id: req.user.id },
                { registration_no: registration_no }
            ]
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Profile already exists for this user or registration number"
            });
        }

        const newProfile = await Student_Profile_Model.create({
            user_id: req.user.id,
            registration_no: registration_no,
            year: year,
            semester: semester, // NEW: Added semester
            section: section,
            cgpa: cgpa,
            skills: skills,
            interest: interest,
            github: github || "",
            linkedin: linkedin || "",
            portfolio: portfolio || ""
        });

        return res.status(201).json({
            message: "Student profile created successfully",
            profile: newProfile
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Student profile already exists"
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get Student Profile (own profile)
UserRouter.get("/student/profile", authJWTMiddleware, async function(req, res) {
    if (req.user.role !== "student") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try {
        const profile = await Student_Profile_Model.findOne({ user_id: req.user.id })
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

// Update Student Profile (PATCH)
UserRouter.patch("/student/profile", authJWTMiddleware, async function(req, res) {
    const requiredBody = z.object({
        year: z.number().min(1).max(5).optional(),
        semester: z.number().min(1).max(10).optional(),
        section: z.string().optional(),
        cgpa: z.number().min(0).max(10).optional(),
        skills: z.array(z.string()).optional(),
        interest: z.array(z.string()).optional(),
        github: z.string().optional().refine(
            (val) => !val || val === "" || githubUrlRegex.test(val),
            "Invalid GitHub URL format. Use: https://github.com/username"
        ),
        linkedin: z.string().optional().refine(
            (val) => !val || val === "" || linkedinUrlRegex.test(val),
            "Invalid LinkedIn URL format. Use: https://linkedin.com/in/username"
        ),
        portfolio: z.string().optional().refine(
            (val) => !val || val === "" || urlRegex.test(val),
            "Invalid portfolio URL format"
        )
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
            message: "Only students can update student profiles"
        });
    }

    try {
        const profile = await Student_Profile_Model.findOne({ user_id: req.user.id });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found. Please create a profile first."
            });
        }

        const { year, semester, section, cgpa, skills, interest, github, linkedin, portfolio } = parsedBody.data;

        // Update only provided fields
        if (year !== undefined) profile.year = year;
        if (semester !== undefined) profile.semester = semester;
        if (section !== undefined) profile.section = section;
        if (cgpa !== undefined) profile.cgpa = cgpa;
        if (skills !== undefined) profile.skills = skills;
        if (interest !== undefined) profile.interest = interest;
        if (github !== undefined) profile.github = github;
        if (linkedin !== undefined) profile.linkedin = linkedin;
        if (portfolio !== undefined) profile.portfolio = portfolio;

        await profile.save();

        // Fetch updated profile with populated user data
        const updatedProfile = await Student_Profile_Model.findOne({ user_id: req.user.id })
            .populate('user_id', 'name email');

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Delete Student Profile (optional - for account cleanup)
UserRouter.delete("/student/profile", authJWTMiddleware, async function(req, res) {
    if (req.user.role !== "student") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try {
        const profile = await Student_Profile_Model.findOneAndDelete({ user_id: req.user.id });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            message: "Profile deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Get a student profile by ID (for mentors to view student details)
UserRouter.get("/student/profile/:studentId", authJWTMiddleware, async function(req, res) {
    const { studentId } = req.params;

    try {
        const profile = await Student_Profile_Model.findOne({ user_id: studentId })
            .populate('user_id', 'name email');

        if (!profile) {
            return res.status(404).json({
                message: "Student profile not found"
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

// Get all students (for teachers to browse)
UserRouter.get("/students", authJWTMiddleware, async function(req, res) {
    // Only teachers can browse student pool
    if (req.user.role !== "teacher") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try {
        const students = await Student_Profiles_Model.find()
            .populate('user_id', 'name email')
            .sort({ cgpa: -1 }); // Sort by CGPA descending

        return res.status(200).json({
            message: "Students fetched successfully",
            students: students
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
    UserRouter: UserRouter
};