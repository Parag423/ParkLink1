const express=require("express");
const cookieParser = require('cookie-parser');

const app=express()
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));
require("dotenv").config()

// Use cookie-parser middleware
app.use(cookieParser());

const PORT=process.env.PORT || 5000



const database=require("./config/dbConnect")
const userRoutes=require("./routes/routers")

database.connect()

app.use(express.json())





app.use("/api/v1/auth", userRoutes)



app.get("/", (req,res)=>{


    return res.json({

        success:true,
        message:"you are at the default home page of the system"
    })
})

app.listen(PORT, (req,res)=>{

    console.log(`App is running at ${PORT}`)
})


// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`App is running at http://0.0.0.0:${PORT}`);
// });