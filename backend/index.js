const express = require("express");
const cors = require("cors");
const { UserRouter } = require("./Routes/User");
const { ProjectRouter } = require("./Routes/Projects");

const app = express();

app.use(express.json())
app.use(cors());

app.use("/user" , UserRouter)
app.use("/project", ProjectRouter);

app.listen(3000);