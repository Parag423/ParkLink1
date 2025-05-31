
const { vehicleEntry, vehicleExit } = require('./auth'); // Adjust path


const dbPool=require("../config/dbConnect");
const mysql = require('mysql2');
const mailSender=require("../utils/mailSender")
const otpGenerator=require("otp-generator")
const otpTemplate=require("../templates/signup");
const contacTemplate=require("../templates/replytoCus");
const reqtemplate=require("../templates/contact-form");
const haversineDistance = require('../utils/haversineDistance'); // Utility function for Haversine formula
const Razorpay = require('razorpay');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const executeQuery = async (query, values) => {
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "jintu",
        database: "ParkingManagement",

        // host:"sql6.freesqldatabase.com",
        // user: "sql6680355",
        // password:"sleEqS2WYc",
        // database: "sql6680355",
    });

    try {
        // Connect to the MySQL database
        await connection.promise().query('START TRANSACTION'); // If you want to start a transaction

        const [rows] = await connection.promise().execute(query, values);

        // Commit the transaction if it was started
        await connection.promise().query('COMMIT');

        return rows;
    } catch (err) {
        // Rollback the transaction if an error occurs
        await connection.promise().query('ROLLBACK');
        throw err;
    } finally {
        // Close the connection
        connection.end();
    }
};


exports.checkVehicleAndRoute = async (req, res) => {
  try {
    const { vehicle_number } = req.body;


    console.log("hhhhh",  vehicle_number );

    
    if (!vehicle_number) {
      return res.status(400).json({ success: false, message: "Vehicle number is required" });
    }

    // Check if the vehicle exists in vehicleChecking table
    const checkQuery = 'SELECT * FROM vehicleChecking WHERE vehicle_number = ?';
    const result = await executeQuery(checkQuery, [vehicle_number]);

    console.log("resulttt", result);

    

  
    if (result.some(v => v.vehicle_number == vehicle_number)) {

      // Vehicle exists — call exit controller
      console.log("Vehicle found in vehicleChecking table. Routing to Exit...");
      return vehicleExit(req, res);
    } else {
      // Vehicle not found — call entry controller
      console.log("Vehicle not found in vehicleChecking table. Routing to Entry...");

      await executeQuery('INSERT INTO vehicleChecking (vehicle_number) VALUES (?)', [vehicle_number]);

      return vehicleEntry(req, res);
    }

  } catch (error) {
    console.error('Error checking vehicle:', error);
    return res.status(500).json({ success: false, message: 'Error processing request' });
  }
};
