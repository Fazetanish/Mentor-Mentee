require("dotenv").config(); // Load env variables FIRST

const express = require("express");
const cors = require("cors");
const { UserRouter } = require("./Routes/User");
const { ProjectRouter } = require("./Routes/Projects");
const { TeacherRouter } = require("./Routes/Teacher");

const app = express();

app.use(express.json())
app.use(cors());

app.use("/user" , UserRouter);
app.use("/project", ProjectRouter);
app.use("/teacher" , TeacherRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000");
    console.log("Email configured for:", process.env.EMAIL_USER || "NOT SET");
});