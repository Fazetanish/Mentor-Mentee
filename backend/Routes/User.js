const express = require("express");
const {Router} = require("express");
const UserRouter = Router();
const { UserModel } = require("../DB/user");

const jwt = require("jsonwebtoken");

require("dotenv").config();
const mongoose = require("mongoose");
const { default: z, email } = require("zod");
const bcrypt = require("bcrypt");

const JWT_Secret_User = process.env.JWT_Secret_User;

mongoose.connect(process.env.Mongo_URL);

UserRouter.use(express.json());

UserRouter.post("/signup" ,async function(req,res){
    const requiredBody = z.object({
        name : z.string().min(2).max(50),
        email : z.email(),
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
        email : z.email(),
        password : z.string().min(8).max(100)
    })

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
        id : user._id
    } , JWT_Secret_User);

    return res.json({
        message : "User signin successful",
        token : token
    })

})

module.exports = ({
    UserRouter : UserRouter
})