const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const prisma = require("./prisma/index");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateToken = () => {
  return jwt.sign({ userId: "1" }, "abc", { expiresIn: "1d" });
};

const setCookieToken = (req, res) => {
  const token = generateToken();
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).send({ message: "Token set in cookie", token: token });
};

app.get("/hello", (req, res) => {
  setCookieToken(req, res);
});

app.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log(name + email);
    const newData = await prisma.User.create({
      data: {
        name: name,
        email: email,
      },
    });
    setCookieToken(req, res);
  } catch (error) {
    console.log("Error" + error);
    return res.status(401).send({
      message: "Error",
      success: false,
      error: error,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    const emailExists = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });;
    console.log(emailExists)
    if (!emailExists) {
      return res.status(401).send({
        message: "Data send Successfully",
        success: false,
      });
    }
    return res.status(201).send({
      message:"Login",
      success:true
    })
  } catch (error) {
    console.log("Error" + error);
    return res.status(401).send({
      message: "Error",
      success: false,
      error: error,
    });
  }
});

app.get("/get-all-user",async(req,res)=>{
  try {
    const data = await prisma.user.findMany({});
    return res.status(201).send({
      message:"Fetch",
      success:true,
      data:data
    })
  } catch (error) {
    return res.status(401).send({
      message: "Error",
      success: false,
      error: error,
    });
  }
})

app.listen(5000, () => {
  console.log("Server Start");
});
