const express = require("express");
const {Router} = require("express");
const UserRouter = Router();
const { UserModel } = require("../DB/user");
const { Student_Profile_Model } = require("../DB/student_profiles");

const jwt = require("jsonwebtoken");

require("dotenv").config();
const mongoose = require("mongoose");
const { default: z, email } = require("zod");
const bcrypt = require("bcrypt");
const { authJWTMiddleware } = require("../Middlewares/authJWT");

const JWT_Secret_User = process.env.JWT_Secret_User;

mongoose.connect(process.env.Mongo_URL);

UserRouter.use(express.json());

UserRouter.post("/signup" ,async function(req,res){
    const requiredBody = z.object({
        name : z.string().min(2).max(50),
        email : z.email("Invalid email format").refine(
            (email) =>
                email.endsWith("@muj.manipal.edu") ||
                email.endsWith("@jaipur.manipal.edu"),
            "Email must be a valid Manipal University address"
            ),
        role : z.enum(["student" , "teacher"]),
        password: z.string().min(8).max(100)
    })

    const parsedBody = requiredBody.safeParse(req.body);
    if(!parsedBody.success){
        return res.json({
            message : "Invalid Credentials",
            error : parsedBody.error.issues
        });
    }

    const {name , email , role , password} = parsedBody.data;
    
    const existingUser = await UserModel.findOne({email})
    if(existingUser){
        return res.json({
            message : "User with this email already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password , 10);

    await UserModel.create({
        name : name,
        password : hashedPassword,
        role : role , 
        email : email
    })

    return res.json({
        message : "User successfully signed up"
    })
});



UserRouter.post("/signin" ,async function(req , res){
    const requiredBody = z.object({
        email: z.email("Invalid email format").refine(
            (email) =>
                email.endsWith("@muj.manipal.edu") ||
                email.endsWith("@jaipur.manipal.edu"),
            "Email must be a valid Manipal University address"
            ),
            
        password: z.string().min(8).max(100),
    });

    const parsedBody = requiredBody.safeParse(req.body)
    if(!parsedBody.success){
        return res.json({
            message : "Error in credentials",
            error : parsedBody.error.issues
        })
    }

    const {email , password} = req.body;

    const user = await UserModel.findOne({email})

    if(!user){
        return res.json({
            message : "User not found"
        })
    }

    const isValidPassword = await bcrypt.compare(password , user.password)
    if(!isValidPassword){
        return res.json({
            message : "Invalid Password"
        });
    }

    const token = jwt.sign({
        email : email,
        id : user._id,
        role : user.role
    } , JWT_Secret_User);

    return res.json({
        message : "User signin successful",
        token : token
    })

})

// Student Profile Route
UserRouter.post("/student/profile", authJWTMiddleware, async function(req, res) {
    const requiredBody = z.object({
        registration_no: z.string().min(1, "Registration number is required").trim(),
        year: z.number().min(1).max(5),
        section: z.string().optional(),
        cgpa: z.number().min(0).max(10).optional(),
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

    const { registration_no, year, section, cgpa, skills, interest } = parsedBody.data;

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

        await Student_Profile_Model.create({
            user_id: req.user.id,
            registration_no: registration_no,
            year: year,
            section: section,
            cgpa: cgpa,
            skills: skills,
            interest: interest
        });

        return res.status(201).json({
            message: "Student profile created successfully"
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Student profile already exists"
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
});

module.exports = ({
    UserRouter : UserRouter
})