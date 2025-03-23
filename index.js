const express = require("express")
const mongoose = require('mongoose');
const cors = require('cors');
const { json } = require("express");
require('dotenv').config()

const app = express()
app.use(express.json());


//const port = 5000 //port on vps
const port = 10000 //port on render
const allowedOrigins = ['http://localhost:5173', 'https://localhost:5173', 'https://localhost:5174', "http://localhost:5174",'https://app.seedpad.io', 'https://seedpad-frontend.vercel.app', "cvc-frontend.vercel.app","https://marv-vs-graf.vercel.app"]; // Add your domain here if you start using one

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'X-Signature'],
    credentials: true 
}));

mongoose.connect(`${process.env.MONGO_URI}`) // for atlas cloud
.then(() => console.log ("connected to mongoDB"))
.catch(error => console.log("error connecting to mongoDB", error))

mongoose.connection.on('error', err => {
    console.log('Mongoose default connection error: ' + err);
});

const user = new mongoose.Schema({
    name: [String],
}, {collection: "users", timestamps: true})

const User = mongoose.model("User", user)

app.post("/api/addUser", async (req,res)=>{
    try{
        const {name} = req.body
        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        await User.updateOne(
        {},
        { $push: { name: name } })
        res.json({ success: true, message: "successfully added" });

    }catch(e){
        console.log(e)
        res.status(500).json({success: false, message: "something went wrong"})
    }

})

app.get("/api/getUsers", async(req,res) =>{
    try{
        const users = await User.find()
        res.json(users)

    }catch(e){console.log(e)}
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
