
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




// exports.sendOTP = async (req, res) => {
//         try {
//             const { email } = req.body;
    
//             const checkUserPresent = await executeQuery('SELECT * FROM VehicleOwner  WHERE email = ?', [email]);

//             console.log(",,,,,,")
//             console.log(checkUserPresent);
    
//             if (checkUserPresent.length!=0) {
//                 return res.status(401).json({
//                     success: false,
//                     message: 'User Already Exists',
//                 });
//             }
    


//             console.log("1")
//             // Generate OTP
//             // ...
    
    
    
//         var otp=otpGenerator.generate(6,{
    
//             upperCaseAlphabets:false,
//             lowerCaseAlphabets:false,
//             specialChars:false
    
    
//         })


//         console.log(2);
    
    
//         var result=await executeQuery('SELECT * FROM OTP WHERE otp_value = ?', [otp]);
    
//         console.log("OTP", otp);
    
//         console.log("result is",result);
    
    
//         while(result.length !=0)
//         {
//             console.log("2");
//             otp=otpGenerator.generate(6,{
    
//                 upperCaseAlphabets:false,
//                 lowerCaseAlphabets:false,
//                 specialChars:false
//             })
//         // console.log("3");
//              result=await executeQuery('SELECT * FROM OTPs WHERE otp_value = ?', [otp]);
//         }
    
    
//     //mail send
    
//     // console.log("4");
    
//     mailSender(email,'OTP Verification for Resume Generator',otpTemplate(otp,'User'));
    
//    // console.log("mail sola ni");
    
    
//             // Insert OTP into the database
//             // ...
    
    
    
//             await executeQuery('INSERT INTO OTP (user_email, otp_value) VALUES (?, ?)', [email, otp]);
    
    
    
    
//             res.status(200).json({
//                 success: true,
//                 message: 'OTP sent successfully',
//                 otp,
//             });
//         } catch (err) {
//             console.log(err);
//             return res.status(500).json({
//                 success: false,
//                 message: err.message,
//             });
//         }
//     };




exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        console.log(email);
        // Check if the user already exists in VehicleOwner
        const checkUserPresent = await executeQuery('SELECT * FROM VehicleOwner WHERE email = ?', [email]);
  console.log("1");
        if (checkUserPresent.length != 0) {
            return res.status(401).json({
                success: false,
                message: 'User Already Exists',
            });
        }

        // Generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // Check if an OTP already exists for the email
        const existingOtpRecord = await executeQuery('SELECT * FROM OTP WHERE user_email = ?', [email]);

        if (existingOtpRecord.length != 0) {
            // Delete the old OTP
            await executeQuery('DELETE FROM OTP WHERE user_email = ?', [email]);
        }

        // Ensure the new OTP is unique
        let result = await executeQuery('SELECT * FROM OTP WHERE otp_value = ?', [otp]);

        while (result.length != 0) {
            // If the generated OTP already exists, generate a new one
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await executeQuery('SELECT * FROM OTP WHERE otp_value = ?', [otp]);
        }
     console.log("2");
        // Send the new OTP via email
        mailSender(email, 'OTP Verification for PARKINGMANAGEMENT', otpTemplate(otp, 'User'));

        // Insert the new OTP into the database
        await executeQuery('INSERT INTO OTP (user_email, otp_value) VALUES (?, ?)', [email, otp]);

        // Send a successful response
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};







// exports.signUp = async (req, res) => {
//     try {
//         const {
//             name, email, password, confirmPassword,
//             otp, type
//         } = req.body;
//          console.log("name is",name);
//         // Check if all required fields are present
//         if (!name || !email || !password || !confirmPassword || !otp || !type) {
//             return res.status(403).json({
//                 success: false,
//                 message: "All the fields are required"
//             });
//         }

//         // Check if passwords match
//         if (password !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password and confirm password do not match"
//             });
//         }

//         // Fetch the OTP from the database
//         const otpRecord = await executeQuery('SELECT otp_value FROM OTP WHERE user_email = ?', [email]);
        

//         if (!otpRecord.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid OTPs"
//             });
//         }

//         const otpValue = otpRecord[0].otp_value;
//         console.log("DB OTP:", otpValue);
//         console.log("Req OTP:", otp);

//         // Check if the OTP matches
//         if (otpValue!= otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid OTP"
//             });
//         }

//         // Check if the user is already registered
//         const existingUser = await executeQuery('SELECT * FROM VehicleOwner WHERE email = ?', [email]);
//         if (existingUser.length != 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User already registered"
//             });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);


//         function generateRandomToken(length) {
//             const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//             let result = '';

//             for (let i = 0; i < length; i++) {
//                 const randomIndex = Math.floor(Math.random() * characters.length);
//                 result += characters.charAt(randomIndex);
//             }

//             return result;
//         }


//         var token = email + generateRandomToken(10);





//         // Insert user data in the correct table based on type
//         if (type === 'vehicle') {

//             await executeQuery('INSERT INTO VehicleOwner (name, email, password, token, usertype) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, token, type]);
        
//         } else {

//             await executeQuery('INSERT INTO ParkingLotsOwner (name, email, password,token, usertype) VALUES (?, ?, ?, ?,?)', [name, email, hashedPassword, token, type]);
//         }

//         // Optionally, delete the OTP after successful verification
//         await executeQuery('DELETE FROM OTP WHERE user_email = ?', [email]);

//         // Send success response
//         return res.status(200).json({
//             success: true,
//             message: "User signed up successfully",
//             token
//         });

//     } catch (error) {
//         console.log("Error is", error);
//         return res.status(500).json({
//             success: false,
//             message: "Signup failed"
//         });
//     }
// };








// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(403).json({
//                 success: false,
//                 message: "All the fields are required"
//             });
//         }

//         // Fetch user details from vehicleowner table
//         let user = await executeQuery('SELECT * FROM VehicleOwner WHERE email = ?', [email]);

//         if (!user || user.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User is not registered, please sign up first"
//             });
//         }

//         // Compare the password with the hashed password in the database
//         const isMatch = await bcrypt.compare(password, user[0].password);

//         if (!isMatch) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Incorrect password"
//             });
//         }

//         // Fetch vehicle details for the logged-in user
//         let vehicles = await executeQuery('SELECT * FROM Vehicle WHERE owner_email = ?', [email]);

//         // Combine user data with vehicle details
//         const userDetails = {

//             name: user[0].name,
//             email: user[0].email,
//             Balance:user[0].amount,
//             Usertype:user[0].usertype,
//             token:user[0].token,
//             vehicles: vehicles.map(vehicle => ({
//                 name:vehicle.veh_name,
//                 brand:vehicle.veh_maker,
//                 number: vehicle.vehicle_number,
//                 vehicle_type: vehicle.vehicle_type,
//                 parking_lots: vehicle.parking_ids // Assuming it's a JSON field
//             }))
//         };

//         // Return user details without setting a cookie
//         res.cookie("token", user[0].token).status(200).json({
//             success: true,
//             userDetails,
//             message: "Logged in successfully"
//         });

//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({
//             success: false,
//             message: "Login Failure, please try again"
//         });
//     }
// };


exports.login = async (req, res) => {
    try {

        
        const { email, password} = req.body;


        console.log(email)
        console.log(password)
        




        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All the fields are required"
            });
        }

        // Fetch user details from vehicleowner table

    
    
            

            var user = await executeQuery('SELECT * FROM VehicleOwner WHERE email = ?', [email]);
        
        

            if (!user || user.length === 0) {
                user=await executeQuery('SELECT * FROM ParkingLotsOwner WHERE email = ?', [email]);
        
            }
            

       

        console.log(3)

        if (!user || user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User is not registered, please sign up first"
            });
        }

        console.log(4)
        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Fetch vehicle details for the logged-in user

        var userDetails;

        var type=user[0].usertype
        if(type=='vehicle'){

            let vehicles = await executeQuery('SELECT * FROM Vehicle WHERE owner_email = ?', [email]);

            // Combine user data with vehicle details
             userDetails = {
            
                name: user[0].name,
                email: user[0].email,
                Balance:Math.floor(user[0].amount),
                Usertype:user[0].usertype,
                token:user[0].token,
                vehicles: vehicles.map(vehicle => ({
                    name:vehicle.veh_name,
                    brand:vehicle.veh_maker,
                    number: vehicle.vehicle_number,
                    vehicle_type: vehicle.vehicle_type,
                    parking_lots: vehicle.parking_ids // Assuming it's a JSON field
                }))
            };
    
//Math.floor(user[0].amount);
        }

        else{


           userDetails = {
    
                name: user[0].name,
                email: user[0].email,
                Balance:user[0].amount,
                Usertype:user[0].usertype,
                token:user[0].token,
                parkinglotsesp32id:user[0].parkinglotsesp32id

            };

           


        }


      
        // Return user details without setting a cookie
        res.cookie("token", user[0].token).status(200).json({
            success: true,
            userDetails,
            message: "Logged in successfully"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Login Failure, please try again"
        });
    }
};



exports.signUp = async (req, res) => {
    try {
        const {
            name, email, password, confirmPassword,
            otp, type
        } = req.body;

        // Check if all required fields are present
        if (!name || !email || !password || !confirmPassword || !otp || !type) {
            return res.status(403).json({
                success: false,
                message: "All the fields are required"
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match"
            });
        }

        // Fetch the OTP from the database
        const otpRecord = await executeQuery('SELECT otp_value FROM OTP WHERE user_email = ?', [email]);
        

        if (!otpRecord.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTPs"
            });
        }

        const otpValue = otpRecord[0].otp_value;
        console.log("DB OTP:", otpValue);
        console.log("Req OTP:", otp);

        // Check if the OTP matches
        if (otpValue!= otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check if the user is already registered

        if(type=='vehicle'){

            var existingUser = await executeQuery('SELECT * FROM VehicleOwner WHERE email = ?', [email]);

        }

        else{



            existingUser = await executeQuery('SELECT * FROM ParkingLotsOwner WHERE email = ?', [email]);


        }



        if (existingUser.length != 0) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);


        function generateRandomToken(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                result += characters.charAt(randomIndex);
            }

            return result;
        }


        var token = email + generateRandomToken(10);





        // Insert user data in the correct table based on type
        if (type === 'vehicle') {

            await executeQuery('INSERT INTO VehicleOwner (name, email, password, token, usertype) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, token, type]);
        
        } else {

            await executeQuery('INSERT INTO ParkingLotsOwner (name, email, password,token, usertype) VALUES (?, ?, ?, ?,?)', [name, email, hashedPassword, token, type]);
        }

        // Optionally, delete the OTP after successful verification
        await executeQuery('DELETE FROM OTP WHERE user_email = ?', [email]);

        // Send success response
        return res.status(200).json({
            success: true,
            message: "User signed up successfully",
            token
        });

    } catch (error) {
        console.log("Error is", error);
        return res.status(500).json({
            success: false,
            message: "Signup failed"
        });
    }
};
















exports.caradd= async (req, res) => {
    try {
        // Extract data from the request body
        const { make, model, reg,token} = req.body;

        // Extract token from cookies
       
    console.log(token);
        // Validate the input fields
        if (!make || !model || !reg || !token) {
            return res.status(400).json({
                success: false,
                message: "Make, model, registration number, and token are required."
            });
        }
console.log(12);
        // Check if the token is valid
       var user = await executeQuery('SELECT * FROM VehicleOwner WHERE token = ?', [token]);
        if (user.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Invalid token. User not found."
            });
        }
console.log(13);
        const ownerEmail = user[0].email; // Get the owner's email from the user record
console.log(ownerEmail);
        // Check if the vehicle with the given registration number already exists
        const existingVehicle = await executeQuery('SELECT * FROM Vehicle WHERE vehicle_number = ?', [reg]);
        if (existingVehicle.length !== 0) {
            return res.status(400).json({
                success: false,
                message: "A vehicle with this registration number already exists."
            });
        }
console.log(11);
        // Insert the new car into the Vehicle table
        await executeQuery('INSERT INTO Vehicle (owner_email, vehicle_number, vehicle_type, veh_name, veh_maker) VALUES (?, ?, ?, ?, ?)', 
            [ownerEmail, reg, 'car', model, make]);
     console.log("1");
            user = await executeQuery('SELECT * FROM VehicleOwner WHERE token = ?', [token]);

            console.log(user);
            let vehicles = await executeQuery('SELECT * FROM Vehicle WHERE owner_email = ?', [ownerEmail]);
            const userDetails = {

                name: user[0].name,
                email: user[0].email,
                Balance:user[0].amount,
                Usertype:user[0].usertype,
                token:user[0].token,
                vehicles: vehicles.map(vehicle => ({
                    name:vehicle.veh_name,
                    brand:vehicle.veh_maker,
                    number: vehicle.vehicle_number,
                    vehicle_type: vehicle.vehicle_type,
                    parking_lots: vehicle.parking_ids // Assuming it's a JSON field
                }))
            };

            console.log(userDetails);
        // Send a success response
        return res.status(200).json({
            success: true,
            message: "Car added successfully.",
            userDetails
        });


      
      

    } catch (error) {
        console.log("Error is", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add the car. Please try again."
        });
    }
};





exports.findNearestParkingLots = async (req, res) => {
    try {
        const { latitude, longitude,token } = req.body; // User's location
         // User token from cookies
      console.log("lat is",latitude);
      console.log("lomg is",longitude);
      console.log("token is",token);
        if (!latitude || !longitude || !token) {
            return res.status(400).json({
                success: false,
                message: "Latitude, longitude, and token are required"
            });
        }
       console.log(1);
        // Get user by token (assuming token is stored in VehicleOwner table)
        const userQuery = 'SELECT * FROM VehicleOwner WHERE token = ?';
        const user = await executeQuery(userQuery, [token]);
       console.log(2);
        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
       console.log(3);
        // Retrieve all parking lots from the database
        const parkingLotsQuery = 'SELECT * FROM ParkingLots';
        const parkingLots = await executeQuery(parkingLotsQuery);

        console.log(4);
        console.log(parkingLots);
        if (parkingLots.length == 0) {
            return res.status(200).json({
                success: true,
                message: "No parking lots available"
            });
        }
    console.log(5)
        // Calculate the distance between the user and each parking lot
        const distances = parkingLots.map(lot => {
            const distance = haversineDistance(latitude, longitude, lot.latitude, lot.longitude);
            return {
                ...lot,
                distance
            };
        });
console.log(6)
        // Sort by distance (ascending order)
        distances.sort((a, b) => a.distance - b.distance);
console.log(6)
        // Get the 5 nearest parking lots
        const nearestParkingLots = distances.slice(0, 5);
console.log(7)
        // Return the 5 nearest parking lots
        return res.status(200).json({
            success: true,
            message: "Nearest parking lots found",
            parkingLots: nearestParkingLots
        });

    } catch (error) {
        console.log("Error is:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};






exports.bookParkingLot = async (req, res) => {
    try {
        const { esp32id, token } = req.body;
       // Assuming token is in the cookies
        console.log(esp32id,token)
        // Validate the token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not provided",
            });
        }

        // Find the user by the token
        const user = await executeQuery('SELECT * FROM VehicleOwner WHERE token = ?', [token]);
        
        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        const userEmail = user[0].email;

        // Check if the parking lot exists and has available space
        const parkingLot = await executeQuery('SELECT * FROM ParkingLots WHERE parkinglotsesp32id = ?', [esp32id]);

        if (parkingLot.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Parking lot not found",
            });
        }

        const availableSpaces = parkingLot[0].parking_available;
        if (availableSpaces <= 0) {
            return res.status(400).json({
                success: false,
                message: "No parking spaces available",
            });
        }

        // Decrement the parking available and book the parking spot
        await executeQuery('UPDATE ParkingLots SET parking_available = parking_available - 1 WHERE parkinglotsesp32id = ?', [esp32id]);

        // Optionally, insert a booking record into a 'Bookings' table
        await executeQuery('INSERT INTO Bookings (user_email, parkinglotsesp32id,booking_time) VALUES (?, ?, NOW())', [userEmail, esp32id]);

        return res.status(200).json({
            success: true,
            message: "Parking lot booked successfully",
        });

    } catch (error) {
        console.log("Error booking parking lot:", error);
        return res.status(500).json({
            success: false,
            message: "Booking failed",
        });
    }
};


exports.getesp32id=async (req, res)=>{


    try{

        const { email} = req.body;
     console.log(email);

        if(!email){

            return res.status(401).json({
                success: false,
                message: "Mail id required",
            });

        }



      //  const bookingdetails = await executeQuery('SELECT * FROM bookings WHERE user_email = ?', [email]);


      const bookingDetails = await executeQuery(
        'SELECT DISTINCT parkinglotsesp32id FROM bookings WHERE user_email = ?',
        [email]
    );
    



    
// if (bookingDetails.length === 0) {
//     console.log('No bookings found for the given email.');
//     // You can return an appropriate response or handle it as needed
//     return res.status(200).json({
//         success: true,
//         esp32Ids
//     });
// } else {
    const esp32Ids = bookingDetails.map(row => row.parkinglotsesp32id);
    console.log('ESP32 IDs:', esp32Ids);
    return res.status(200).json({
        success: true,
        esp32Ids
       
    });
}

    // }

    

        catch (error) {
            
            return res.status(500).json({
                success: false,
                message: "Booking Details finding error",
            });
        }



    







}




exports.cancelBooking = async (req, res) => {
    try {
        const { esp32id,token } = req.body;
        
       console.log(esp32id);
       console.log("token is ",token);
        // Validate the token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not provided",
            });
        }

        // Find the user by the token
        const user = await executeQuery('SELECT * FROM VehicleOwner WHERE token = ?', [token]);

        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        const userEmail = user[0].email;

        // Check if the booking exists
        const booking = await executeQuery('SELECT * FROM Bookings WHERE user_email = ? AND parkinglotsesp32id = ?', [userEmail, esp32id]);

        if (booking.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Remove the booking record from the 'Bookings' table
        await executeQuery('DELETE FROM Bookings WHERE user_email = ? AND parkinglotsesp32id = ?', [userEmail, esp32id]);

        // Increment the parking available spaces
        await executeQuery('UPDATE ParkingLots SET parking_available = parking_available + 1 WHERE parkinglotsesp32id = ?', [esp32id]);

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
        });

    } catch (error) {
        console.log("Error cancelling booking:", error);
        return res.status(500).json({
            success: false,
            message: "Cancellation failed",
        });
    }
};


exports.addlot= async (req, res)=>{
    try{
    
        const { address,house,contactnumber,token } = req.body;
    
    
    
    
    
    
         // Validate input
         if (!token || !address || !house || !contactnumber) {
            return res.status(400).json({
                success: false,
                message: "All fields (email, address, houseNo, mobileNo) are required",
            });
        }
    
    
    
        const [rows] = await executeQuery('SELECT email FROM ParkingLotsOwner WHERE token = ?', [token]);
        console.log(rows)
        console.log(token);
      var email;
    if (Object.keys(rows).length > 0) {
        email = rows.email;

        console.log("Email found:", email);
    } else {
        console.log("No email found for the provided token.");
    }
    

     console.log("in");
        console.log("eeee", email)
        mailSender(email,"Acceptance MSG from ParkLink", contacTemplate() );
    
    
        console.log("out");
    
    
    
        mailSender('jintukumarnathnath@gmail.com', 'Customer Requesting Lots approval', reqtemplate(address,house,contactnumber));
    
        // Send a successful response
        return res.status(200).json({
            success: true,
            message: 'MSG sent successfully',
           
        });
    
    
    
    }
    
    catch (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send email",
        });
    }
    
    
    
    
    }




    exports.approve=async (req, res)=>{

        try{
    
            const { email, parkingLotName, fullCapacity, espid, latitude, longitude,address}= req.body
    
        console.log(email, parkingLotName, fullCapacity, espid, latitude, longitude);
    
            if(!email || !parkingLotName || !fullCapacity ||!address || !espid  || !latitude || !longitude)
            {
    
    
                console.log("All field required")
    
                return res.status(400).json({
    
    
                    success:true,
                    message:'All fields required'
                })
            }
    
    
    
            await executeQuery('INSERT INTO ParkingLots (parking_available,total_capacity, owner_email, parkinglotsesp32id, latitude, longitude,name,address) VALUES (?,?, ?, ?, ?, ?,?,?)', [fullCapacity,fullCapacity,  email, espid, latitude,  longitude,parkingLotName,address]);
    
    
    
            return res.status(200).json({
                     success: true,
                     message: "Approve Successfull",
                   
                 });
    
    
    
    
    
    
    
        }
    
        catch (error) {
            console.log("Error updating Approve  ParkingLots:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to approve parkinglots",
            });
        }
    
    
    
    
    
    
    };





exports.updateParkingAvailability = async (req, res) => {
        try {
            const  esp32Data = req.body; // distances is an array of distance values sent by ESP32
         
            var esp32id=esp32Data[0];


            console.log(esp32Data);
            
            function removeFirstElement(arr) {
                return arr.slice(1); // Returns a new array without the first element
              }
              
              
              const distances = removeFirstElement(esp32Data);
              
              console.log(distances); // [75.77, 108.71, 127.6, 48.16]  



           
            if (!esp32id || !Array.isArray(distances)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid input: esp32id and distances are required",
                });
            }
    
            // Filter distances greater than 15
            const countGreaterThan15 = distances.filter(distance => distance > 15).length;
    
            // Fetch the parking lot by esp32id
            const parkingLot = await executeQuery('SELECT * FROM ParkingLots WHERE parkinglotsesp32id = ?', [esp32id]);
    
            if (parkingLot.length === 0) {

                console.log(111);
                return res.status(200).json({
                    success: true,
                    message: "Parking lot not found",
                });
            }
    
            // Update the parking available value in the ParkingLots table
            await executeQuery('UPDATE ParkingLots SET parking_available = ? WHERE parkinglotsesp32id = ?', [countGreaterThan15, esp32id]);
    
            return res.status(200).json({
                success: true,
                message: "Parking availability updated successfully",
                data: {
                    parkinglotsesp32id: esp32id,
                    parking_available: countGreaterThan15,
                },
            });
    
        } catch (error) {
            console.log("Error updating parking availability:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update parking availability",
            });
        }
    };    



    
 

    exports.lotsdetails= async (req, res)=>{

        try{
        
        
            const {email}= req.body
        console.log(email);
            if(!email)
            {
        
                console.log("Email is required");
            }
        
        
        
            const parkingLot = await executeQuery('SELECT * FROM ParkingLots WHERE owner_email = ?', [email]);
        
                if (parkingLot.length === 0) {
                    
                    console.log("No Parking Lot available for this owner")
                }
        
        
        
                console.log("Parking lots details", parkingLot);
        
        
        
                return res.status(200).json({
        
        
                    success:true,
                    message:"Details send to Front End",
                    parkingLot
                })
        
        }
        
        catch(error)
        {
        
        
            console.log("Error in fetching Lots Details")
        
            return res.status(500).json({
                success: false,
                message: "Failed to Fetch Lots Details",
            });
        }
        
        }



    // exports.createorder= async (req, res) => {
    //         try {
    //           const { amount, email } = req.body;
          
    //           if (!amount || !email) {
    //             return res.status(400).json({ success: false, message: "Invalid request" });
    //           }
          
    //           const options = {
    //             amount: amount, // Amount in paisa (e.g., 100 INR = 10000 paisa)
    //             currency: "INR",
    //             receipt: `receipt_${Date.now()}`,
    //           };
          
    //           const order = await razorpay.orders.create(options);
          
    //           res.json({
    //             success: true,
    //             id: order.id,
    //             amount: order.amount,
    //             currency: order.currency,
    //           });
    //         } catch (error) {
    //           console.error("Error creating Razorpay order:", error);
    //           res.status(500).json({ success: false, message: "Something went wrong" });
    //         }
    //       };

    const razorpay = new Razorpay({
      key_id: 'rzp_test_M490QZYuqB0lSb', // Replace with your Razorpay key ID
      key_secret: 'MY9ZagtQxmHMWAcdyLN9eG0Q', // Replace with your Razorpay key secret
    });
    
    exports.createorder = async (req, res) => {
      try {
        const { amount, email } = req.body;
    
        if (!amount || !email) {
          return res.status(400).json({ success: false, message: "Invalid request" });
        }
    
        const options = {
          amount: amount * 100, // Amount in paise (1 INR = 100 paise)
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        };
    
        const order = await razorpay.orders.create(options);
    
        res.json({
          success: true,
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        });
      } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
      }
    };




    exports.verifypayment = async (req, res) => {
      try {
        const { payment_id, order_id, signature,email,amount } = req.body;
    
        if (!payment_id || !order_id || !signature) {
          return res.status(400).json({ success: false, message: "Invalid request" });
        }
    
        const generated_signature = crypto
          .createHmac("sha256", "MY9ZagtQxmHMWAcdyLN9eG0Q") // Replace with your Razorpay key secret
          .update(order_id + "|" + payment_id)
          .digest("hex");
    
        if (generated_signature === signature) {
          // Payment is successful
          console.log(email);
          console.log(amount);

          const result = await executeQuery(
            'UPDATE VehicleOwner SET amount = amount + ? WHERE email = ?',
            [amount, email]
          );

          
            console.log("Amount Updated successfully");


            
            var user = await executeQuery('SELECT * FROM VehicleOwner WHERE email = ?', [email]);

            let vehicles = await executeQuery('SELECT * FROM Vehicle WHERE owner_email = ?', [email]);


            userDetails = {
            
                name: user[0].name,
                email: user[0].email,
                Balance:user[0].amount,
                Usertype:user[0].usertype,
                token:user[0].token,
                vehicles: vehicles.map(vehicle => ({
                    name:vehicle.veh_name,
                    brand:vehicle.veh_maker,
                    number: vehicle.vehicle_number,
                    vehicle_type: vehicle.vehicle_type,
                    parking_lots: vehicle.parking_ids // Assuming it's a JSON field
                }))
            };







          res.json({ success: true, message: "Payment verified successfully", userDetails });
        } else {
          // Payment verification failed
          res.status(400).json({ success: false, message: "Invalid signature" });
        }
      } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
      }
    };

    // exports.verifypayment= async (req, res) => {


    //         try {
    //           const { payment_id, order_id, signature } = req.body;
          
    //           if (!payment_id || !order_id || !signature) {
    //             return res.status(400).json({ success: false, message: "Invalid request" });
    //           }
          
    //           const generated_signature = crypto
    //             .createHmac("sha256", "MY9ZagtQxmHMWAcdyLN9eG0Q") // Replace with your Razorpay key secret
    //             .update(order_id + "|" + payment_id)
    //             .digest("hex");
          
    //           if (generated_signature === signature) {
    //             // Payment is successful
    //             res.json({ success: true, message: "Payment verified successfully" });
    //           } else {
    //             // Payment verification failed
    //             res.status(400).json({ success: false, message: "Invalid signature" });
    //           }
    //         } catch (error) {
    //           console.error("Error verifying Razorpay payment:", error);
    //           res.status(500).json({ success: false, message: "Something went wrong" });
    //         }
    //       };







// Vehicle Entry Controller
// exports.vehicleEntry = async (req, res) => {
//     const { vehicle_number, parkinglotsesp32id, latitude, longitude } = req.body;

//     const currentTime = new Date();
//     const entryTime = currentTime.toTimeString().split(' ')[0];
//     const entryDate = currentTime.toISOString().split('T')[0];

//     const query = `INSERT INTO VehicleParkingDetails  
//         (vehicle_number, entry_time, entry_date, latitude, longitude, parkinglotsesp32id)
//         VALUES (?, ?, ?, ?, ?, ?)`;

//     try {
//         await executeQuery(query, [
//             vehicle_number,
//             entryTime,
//             entryDate,
//             latitude,
//             longitude,
//             parkinglotsesp32id,
//         ]);
//         res.status(200).json({ message: 'Vehicle entry recorded successfully' });
//     } catch (error) {
//         console.error('Vehicle Entry Error:', error);
//         res.status(500).json({ error: 'Failed to record entry' });
//     }
// };


exports.vehicleEntry = async (req, res) => {
    const { vehicle_number } = req.body;

    const currentTime = new Date();
    const entryTime = currentTime.toTimeString().split(' ')[0];
    const entryDate = currentTime.toISOString().split('T')[0];

    try {

        console.log("1122222232")
        // Check if vehicle_number already exists
        const checkQuery = 'SELECT * FROM VehicleParkingDetails WHERE vehicle_number = ?';
        const rows = await executeQuery(checkQuery, [vehicle_number]);

        if (rows.length > 0) {
            // Vehicle exists – update entry time and date
            const updateQuery = `UPDATE VehicleParkingDetails 
                                 SET entry_time = ?, entry_date = ? 
                                 WHERE vehicle_number = ?`;
            await executeQuery(updateQuery, [entryTime, entryDate, vehicle_number]);

            res.status(200).json({ message: 'Entry time updated for existing ' });
        } else {
            // Vehicle does not exist – insert new row with vehicle number and time
            const insertQuery = `INSERT INTO VehicleParkingDetails 
                                 (vehicle_number, entry_time, entry_date) 
                                 VALUES (?, ?, ?)`;
            await executeQuery(insertQuery, [vehicle_number, entryTime, entryDate]);

            res.status(200).json({ message: 'New vehicle entry recorded' });
        }
    } catch (error) {
        console.error('Vehicle Entry Error:', error);
        res.status(500).json({ error: 'Failed to process vehicle entry' });
    }
};


// Vehicle Exit Controller



// exports.vehicleExit = async (req, res) => {
//     try {
//       const { vehicle_number } = req.body;
  
//       if (!vehicle_number) {
//         return res.status(400).json({ success: false, message: "Vehicle number is required" });
//       }
  
//       // Fetch vehicle and owner info
//       const vehicleResult = await executeQuery('SELECT * FROM Vehicle WHERE vehicle_number = ?', [vehicle_number]);
//       if (vehicleResult.length === 0) {
//         return res.status(404).json({ success: false, message: "Vehicle not found" });
//       }
  
//       const ownerEmail = vehicleResult[0].owner_email;
  
//       // Get latest parking record
//       const parkingRecord = await executeQuery(
//         `SELECT * FROM VehicleParkingDetails 
//          WHERE vehicle_number = ? 
//          ORDER BY entry_date DESC, entry_time DESC 
//          LIMIT 1`,
//         [vehicle_number]
//       );
      
  
//       if (parkingRecord.length === 0) {
//         return res.status(404).json({ success: false, message: "No active parking record found" });
//       }
  
//       const entryDate = parkingRecord[0].entry_date;
//       console.log("date...",entryDate);
//       const entryTime = parkingRecord[0].entry_time;
//       const entryDateTime = new Date(`${entryDate}T${entryTime}`);
  
//       const exitDateTime = new Date();
//       console.log("ex...",exitDateTime)
//       console.log("entry...",entryDateTime)
  
//       // Calculate duration in minutes
//       const diffMs = exitDateTime - entryDateTime;
//       const diffMinutes = Math.ceil(diffMs / (1000 * 60));
//       const parkingCharge = diffMinutes * 1; // ₹1 per minute

//       console.log(".....ssss",diffMinutes );
//       console.log(".....pppp", parkingCharge);
  
//       // Fetch user's current balance
//       const userResult = await executeQuery('SELECT amount FROM VehicleOwner WHERE email = ?', [ownerEmail]);
//       if (userResult.length === 0) {
//         return res.status(404).json({ success: false, message: "Owner not found" });
//       }
  
//       const currentBalance = parseFloat(userResult[0].amount);
//       if (isNaN(currentBalance) || currentBalance < parkingCharge) {
//         return res.status(400).json({ success: false, message: "Insufficient balance" });
//       }
  
//       // Deduct parking charge
//       await executeQuery(
//         `UPDATE VehicleOwner 
//          JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email 
//          SET VehicleOwner.amount = VehicleOwner.amount - ? 
//          WHERE Vehicle.vehicle_number = ?`,
//         [parkingCharge, vehicle_number]
//       );
  
//       // Update exit time and charge
//       const exitTime = exitDateTime.toTimeString().split(' ')[0];     // 'HH:MM:SS'
//       const exitDate = exitDateTime.toISOString().split('T')[0];      // 'YYYY-MM-DD'
  
//       await executeQuery(
//         `UPDATE VehicleParkingDetails 
//          SET exit_time = ?, exit_date = ?, charge = ?
//          WHERE id = ?`,
//         [exitTime, exitDate, parkingCharge, parkingRecord[0].id]
//       );
  
//       res.status(200).json({ success: true, message: "Vehicle exit recorded", charge: parkingCharge });
//     } catch (error) {
//       console.error("Vehicle Exit Error:", error);
//       res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
//   };
  

// exports.vehicleExit = async (req, res) => {
//   try {
//     const { vehicle_number } = req.body;

//     if (!vehicle_number) {
//       return res.status(400).json({ success: false, message: "Vehicle number is required" });
//     }

//     // Fetch the latest parking record for this vehicle
//     const vehicleRecord = await executeQuery(
//       `SELECT * FROM VehicleParkingDetails 
//        WHERE vehicle_number = ? 
//        ORDER BY entry_date DESC, entry_time DESC 
//        LIMIT 1`,
//       [vehicle_number]
//     );

//     if (!vehicleRecord || vehicleRecord.length === 0) {
//       return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
//     }

//     const { entry_date, entry_time } = vehicleRecord[0]; 

//     const [year, month, day] = entry_date.split('-').map(Number);
//     const [hour, minute, second] = entry_time.split(':').map(part => parseInt(part));
    
//     // Construct a valid Date object manually
//     const entryDateTime = new Date(year, month - 1, day, hour, minute, second);
//     console.log("entry..",entryDateTime)

//     if (isNaN(entryDateTime.getTime())) {
//       return res.status(400).json({ success: false, message: "Invalid entry date/time" });
//     }

//     const exitDateTime = new Date();

//     const durationMs = exitDateTime - entryDateTime;
//     const durationMinutes = Math.ceil(durationMs / (60 * 1000)); // round up to nearest minute

//     const ratePerMinute = 1; // for testing, Rs.1 per minute
//     const totalCharge = durationMinutes * ratePerMinute;

//     // Update user's balance
//     const updateResult = await executeQuery(
//       `UPDATE VehicleOwner 
//        JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email 
//        SET VehicleOwner.amount = VehicleOwner.amount - ? 
//        WHERE Vehicle.vehicle_number = ?`,
//       [totalCharge, vehicle_number]
//     );

//     if (updateResult.affectedRows === 0) {
//       return res.status(500).json({ success: false, message: "Failed to deduct balance" });
//     }

//     // Save the exit time and date
//     const formattedExitDate = exitDateTime.toISOString().split("T")[0]; // YYYY-MM-DD
//     const formattedExitTime = exitDateTime.toTimeString().split(" ")[0]; // HH:MM:SS

//     await executeQuery(
//       `UPDATE VehicleParkingDetails 
//        SET exit_time = ?, exit_date = ? 
//        WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
//       [formattedExitTime, formattedExitDate, vehicle_number, entry_date, entry_time]
//     );

//     return res.json({
//       success: true,
//       message: "Vehicle exit recorded successfully",
//       durationMinutes,
//       totalCharge
//     });

//   } catch (error) {
//     console.error("Vehicle Exit Error:", error);
//     res.status(500).json({ success: false, message: "Something went wrong during exit process" });
//   }
// };


// exports.vehicleExit = async (req, res) => {
//     try {
//       const { vehicle_number } = req.body;
  
//       if (!vehicle_number) {
//         return res.status(400).json({ success: false, message: "Vehicle number is required" });
//       }
  
//       // Fetch the latest parking record for this vehicle
//       const vehicleRecord = await executeQuery(
//         `SELECT vehicle_number, DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, entry_time 
//          FROM VehicleParkingDetails 
//          WHERE vehicle_number = ? 
//          ORDER BY entry_date DESC, entry_time DESC 
//          LIMIT 1`,
//         [vehicle_number]
//       );
  
//       if (!vehicleRecord || vehicleRecord.length === 0) {
//         return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
//       }
  
//       const { entry_date, entry_time } = vehicleRecord[0];
  
//       if (!entry_date || !entry_time) {
//         return res.status(400).json({ success: false, message: "Entry date or time is missing" });
//       }
  
//       // Split the entry_date string (now guaranteed to be YYYY-MM-DD)
//       const [year, month, day] = entry_date.split('-').map(Number);
//       const [hour, minute, second] = entry_time.split(':').map(part => parseInt(part));
  
//       // Construct a valid Date object
//       const entryDateTime = new Date(year, month - 1, day, hour, minute, second);
//       console.log("entryDateTime:", entryDateTime);
  
//       if (isNaN(entryDateTime.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid entry date/time" });
//       }
  
//       const exitDateTime = new Date();

//       console.log("exit", exitDateTime);
  
//       const durationMs = exitDateTime - entryDateTime;
//       const durationMinutes = Math.ceil(durationMs / (60 * 1000)); // round up to nearest minute
  
//       const ratePerMinute = 1; // for testing, Rs.1 per minute
//       const totalCharge = durationMinutes * ratePerMinute;
  
//       // Update user's balance
//       const updateResult = await executeQuery(
//         `UPDATE VehicleOwner 
//          JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email 
//          SET VehicleOwner.amount = VehicleOwner.amount - ? 
//          WHERE Vehicle.vehicle_number = ?`,
//         [totalCharge, vehicle_number]
//       );
  
//       if (updateResult.affectedRows === 0) {
//         return res.status(500).json({ success: false, message: "Failed to deduct balance" });
//       }
  
//       // Save the exit time and date
//       const formattedExitDate = exitDateTime.toISOString().split("T")[0]; // YYYY-MM-DD
//       const formattedExitTime = exitDateTime.toTimeString().split(" ")[0]; // HH:MM:SS
  
//       await executeQuery(
//         `UPDATE VehicleParkingDetails 
//          SET exit_time = ?, exit_date = ? 
//          WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
//         [formattedExitTime, formattedExitDate, vehicle_number, entry_date, entry_time]
//       );
  
//       return res.json({
//         success: true,
//         message: "Vehicle exit recorded successfully",
//         durationMinutes,
//         totalCharge
//       });
  
//     } catch (error) {
//       console.error("Vehicle Exit Error:", error);
//       res.status(500).json({ success: false, message: "Something went wrong during exit process" });
//     }
//   };



// exports.vehicleExit = async (req, res) => {
//     try {
//       const { vehicle_number } = req.body;
  
//       if (!vehicle_number) {
//         return res.status(400).json({ success: false, message: "Vehicle number is required" });
//       }
  
//       // Fetch the latest parking record for this vehicle
//       const vehicleRecord = await executeQuery(
//         `SELECT vehicle_number,
//                 DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date,
//                 entry_time
//          FROM VehicleParkingDetails
//          WHERE vehicle_number = ?
//          ORDER BY entry_date DESC, entry_time DESC
//          LIMIT 1`,
//         [vehicle_number]
//       );
  
//       if (!vehicleRecord || vehicleRecord.length === 0) {
//         return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
//       }
  
//       const { entry_date, entry_time } = vehicleRecord[0];
  
//       // Parse entry date and time into a Date object
//       const [year, month, day] = entry_date.split('-').map(Number);
//       const [hour, minute, second] = entry_time.split(':').map(Number);
//       const entryDateTime = new Date(year, month - 1, day, hour, minute, second);
  
//       if (isNaN(entryDateTime.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid entry date/time" });
//       }
  
//       const exitDateTime = new Date();
  
//       // Calculate duration in hours (as a float, rounded to 2 decimals)
//       const durationMs = exitDateTime - entryDateTime;
//       const durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
  
//       // Define rate per hour (e.g., Rs. 60 per hour)
//       const ratePerHour = 60;
//       const totalCharge = parseFloat((durationHours * ratePerHour).toFixed(2));
  
//       // Deduct charge from owner's balance
//       const updateResult = await executeQuery(
//         `UPDATE VehicleOwner
//          JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email
//          SET VehicleOwner.amount = VehicleOwner.amount - ?
//          WHERE Vehicle.vehicle_number = ?`,
//         [totalCharge, vehicle_number]
//       );
  
//       if (updateResult.affectedRows === 0) {
//         return res.status(500).json({ success: false, message: "Failed to deduct balance" });
//       }
  
//       // Save exit time and date
//       const formattedExitDate = exitDateTime.toISOString().split('T')[0];  // YYYY-MM-DD
//       const formattedExitTime = exitDateTime.toTimeString().split(' ')[0]; // HH:MM:SS
  
//       await executeQuery(
//         `UPDATE VehicleParkingDetails
//          SET exit_time = ?, exit_date = ?
//          WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
//         [formattedExitTime, formattedExitDate, vehicle_number, entry_date, entry_time]
//       );
  
//       return res.json({
//         success: true,
//         message: "Vehicle exit recorded successfully",
//         durationHours,
//         ratePerHour,
//         totalCharge
//       });
  
//     } catch (error) {
//       console.error("Vehicle Exit Error:", error);
//       res.status(500).json({ success: false, message: "Something went wrong during exit process" });
//     }
//   };
  


// exports.vehicleExit = async (req, res) => {
//     try {
//       const { vehicle_number } = req.body;
  
//       if (!vehicle_number) {
//         return res.status(400).json({ success: false, message: "Vehicle number is required" });
//       }
  
//       // Fetch the latest parking record for this vehicle
//       const vehicleRecord = await executeQuery(
//         `SELECT vehicle_number,
//                 DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date,
//                 entry_time
//          FROM VehicleParkingDetails
//          WHERE vehicle_number = ?
//          ORDER BY entry_date DESC, entry_time DESC
//          LIMIT 1`,
//         [vehicle_number]
//       );
  
//       if (!vehicleRecord || vehicleRecord.length === 0) {
//         return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
//       }
  
//       const { entry_date, entry_time } = vehicleRecord[0];
  
//       // Parse entry date and time into local Date object (IST assumed for server)
//       const [year, month, day] = entry_date.split('-').map(Number);
//       const [hour, minute, second] = entry_time.split(':').map(Number);
//       const entryDateTime = new Date(year, month - 1, day, hour, minute, second);
  
//       if (isNaN(entryDateTime.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid entry date/time" });
//       }
  
//       // Current server time as exit timestamp
//       const exitDateTime = new Date();
  
//       // Calculate duration in hours (float, rounded to 2 decimals)
//       const durationMs = exitDateTime - entryDateTime;
//       const durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
  
//       // Define rate per hour (e.g., Rs. 60 per hour)
//       const ratePerHour = 60;
//       const totalCharge = parseFloat((durationHours * ratePerHour).toFixed(2));
  
//       // Deduct charge from owner's balance
//       const updateOwner = await executeQuery(
//         `UPDATE VehicleOwner
//          JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email
//          SET VehicleOwner.amount = VehicleOwner.amount - ?
//          WHERE Vehicle.vehicle_number = ?`,
//         [totalCharge, vehicle_number]
//       );
  
//       if (updateOwner.affectedRows === 0) {
//         return res.status(500).json({ success: false, message: "Failed to deduct balance" });
//       }
  
//       // Prepare DB-safe exit date/time in UTC-derived ISO parts
//       const formattedExitDateDB = exitDateTime.toISOString().substring(0, 10); // YYYY-MM-DD
//       const formattedExitTimeDB = exitDateTime.toISOString().substring(11, 19); // HH:MM:SS
  
//       // Update exit details in database
//       await executeQuery(
//         `UPDATE VehicleParkingDetails
//          SET exit_time = ?, exit_date = ?
//          WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
//         [formattedExitTimeDB, formattedExitDateDB, vehicle_number, entry_date, entry_time]
//       );
  
//       // Format for Indian display: DD-MM-YYYY and 24h time
//       const formattedEntryDateDisplay = entryDateTime.toLocaleDateString('en-IN');
//       const formattedEntryTimeDisplay = entryDateTime.toLocaleTimeString('en-IN', { hour12: false });
//       const formattedExitDateDisplay = exitDateTime.toLocaleDateString('en-IN');
//       const formattedExitTimeDisplay = exitDateTime.toLocaleTimeString('en-IN', { hour12: false });
  
//       return res.json({
//         success: true,
//         message: "Vehicle exit recorded successfully",
//         entryDate: `${formattedEntryDateDisplay} ${formattedEntryTimeDisplay}`,
//         exitDate: `${formattedExitDateDisplay} ${formattedExitTimeDisplay}`,
//         durationHours,
//         ratePerHour,
//         totalCharge
//       });
  
//     } catch (error) {
//       console.error("Vehicle Exit Error:", error);
//       res.status(500).json({ success: false, message: "Something went wrong during exit process" });
//     }
//   };

// exports.vehicleExit = async (req, res) => {
//     try {
//       const { vehicle_number } = req.body;
  
//       if (!vehicle_number) {
//         return res.status(400).json({ success: false, message: "Vehicle number is required" });
//       }
  
//       // Fetch the latest parking record for this vehicle
//       const vehicleRecord = await executeQuery(
//         `SELECT vehicle_number,
//                 DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date,
//                 entry_time
//          FROM VehicleParkingDetails
//          WHERE vehicle_number = ?
//          ORDER BY entry_date DESC, entry_time DESC
//          LIMIT 1`,
//         [vehicle_number]
//       );
  
//       if (!vehicleRecord || vehicleRecord.length === 0) {
//         return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
//       }
  
//       const { entry_date, entry_time } = vehicleRecord[0];
  
//       // Parse entry into local Date object (IST assumed)
//       const [eYear, eMonth, eDay] = entry_date.split('-').map(Number);
//       const [eHour, eMinute, eSecond] = entry_time.split(':').map(Number);
//       const entryDateTime = new Date(eYear, eMonth - 1, eDay, eHour, eMinute, eSecond);
  
//       if (isNaN(entryDateTime.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid entry date/time" });
//       }
  
//       // Current time as exit timestamp (local server time)
//       const exitDateTime = new Date();
  
//       // Format entry and exit times in Indian style for display
//       const entryDateDisplay = entryDateTime.toLocaleDateString('en-IN');
//       const entryTimeDisplay = entryDateTime.toLocaleTimeString('en-IN', { hour12: false });
//       const exitDateDisplay = exitDateTime.toLocaleDateString('en-IN');
//       const exitTimeDisplay = exitDateTime.toLocaleTimeString('en-IN', { hour12: false });
  
//       // Calculate duration using local Date objects
//       const durationMs = exitDateTime.getTime() - entryDateTime.getTime();
//       const durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
  
//       // Define rate per hour
//       const ratePerHour = 60;
//       const totalCharge = parseFloat((durationHours * ratePerHour).toFixed(2));
  
//       // Deduct charge
//       const updateOwner = await executeQuery(
//         `UPDATE VehicleOwner
//          JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email
//          SET VehicleOwner.amount = VehicleOwner.amount - ?
//          WHERE Vehicle.vehicle_number = ?`,
//         [totalCharge, vehicle_number]
//       );
//       if (updateOwner.affectedRows === 0) {
//         return res.status(500).json({ success: false, message: "Failed to deduct balance" });
//       }
  
//       // Prepare local exit date/time for DB (YYYY-MM-DD and HH:MM:SS)
//       const dYear = exitDateTime.getFullYear();
//       const dMonth = String(exitDateTime.getMonth() + 1).padStart(2, '0');
//       const dDay = String(exitDateTime.getDate()).padStart(2, '0');
//       const dHour = String(exitDateTime.getHours()).padStart(2, '0');
//       const dMinute = String(exitDateTime.getMinutes()).padStart(2, '0');
//       const dSecond = String(exitDateTime.getSeconds()).padStart(2, '0');
//       const exitDateDB = `${dYear}-${dMonth}-${dDay}`;
//       const exitTimeDB = `${dHour}:${dMinute}:${dSecond}`;
  
//       // Update exit details in DB
//       await executeQuery(
//         `UPDATE VehicleParkingDetails
//          SET exit_time = ?, exit_date = ?
//          WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
//         [exitTimeDB, exitDateDB, vehicle_number, entry_date, entry_time]
//       );
  
//       return res.json({
//         success: true,
//         message: "Vehicle exit recorded successfully",
//         entryDate: `${entryDateDisplay} ${entryTimeDisplay}`,
//         exitDate: `${exitDateDisplay} ${exitTimeDisplay}`,
//         durationHours,
//         ratePerHour,
//         totalCharge
//       });
  
//     } catch (error) {
//       console.error("Vehicle Exit Error:", error);
//       res.status(500).json({ success: false, message: "Something went wrong during exit process" });
//     }
//   };
  

// exports.vehicleExit = async (req, res) => {
//     try {
//       const { vehicle_number } = req.body;
  
//       if (!vehicle_number) {
//         return res.status(400).json({ success: false, message: "Vehicle number is required" });
//       }
  
//       // Fetch the latest parking record for this vehicle
//       const vehicleRecord = await executeQuery(
//         `SELECT vehicle_number,
//                 DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date,
//                 entry_time
//          FROM VehicleParkingDetails
//          WHERE vehicle_number = ?
//          ORDER BY entry_date DESC, entry_time DESC
//          LIMIT 1`,
//         [vehicle_number]
//       );
  
//       if (!vehicleRecord || vehicleRecord.length === 0) {
//         return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
//       }
  
//       const { entry_date, entry_time } = vehicleRecord[0];
  
//       // Parse entry DateTime from ISO-local string (assumes entry_date and entry_time are in server local IST)
//       const entryDateTime = new Date(`${entry_date}T${entry_time}`);
  
//       console.log("eeeeee",entryDateTime);
//       if (isNaN(entryDateTime.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid entry date/time" });
//       }
  
//       // Current timestamp for exit
//       const exitDateTime = new Date();
  
//       // Format entry and exit for display in Indian format
//       const entryDateDisplay = entryDateTime.toLocaleDateString('en-IN');
//       const entryTimeDisplay = entryDateTime.toLocaleTimeString('en-IN', { hour12: false });
//       const exitDateDisplay = exitDateTime.toLocaleDateString('en-IN');
//       const exitTimeDisplay = exitDateTime.toLocaleTimeString('en-IN', { hour12: false });
  
//       // Calculate duration in hours with proper local offset
//       const durationMs = exitDateTime - entryDateTime;
//       const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
//       const remainingMs = durationMs - durationHours * 1000 * 60 * 60;
//       const durationMinutes = Math.round(remainingMs / (1000 * 60));
//       // Combine hours and minutes as a float, e.g., 1.25 for 1h15m
//       const durationDecimal = parseFloat((durationHours + durationMinutes / 60).toFixed(2));
  
//       // Define rate per hour and calculate total
//       const ratePerHour = 60;
//       const totalCharge = parseFloat((durationDecimal * ratePerHour).toFixed(2));
  
//       // Deduct charge from balance
//       const updateOwner = await executeQuery(
//         `UPDATE VehicleOwner
//          JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email
//          SET VehicleOwner.amount = VehicleOwner.amount - ?
//          WHERE Vehicle.vehicle_number = ?`,
//         [totalCharge, vehicle_number]
//       );
  
//       if (updateOwner.affectedRows === 0) {
//         return res.status(500).json({ success: false, message: "Failed to deduct balance" });
//       }
  
//       // Prepare exit Date and Time for DB insert
//       const exitDateDB = exitDateTime.toISOString().split('T')[0];
//       const exitTimeDB = exitDateTime.toTimeString().split(' ')[0];
  
//       await executeQuery(
//         `UPDATE VehicleParkingDetails
//          SET exit_time = ?, exit_date = ?
//          WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
//         [exitTimeDB, exitDateDB, vehicle_number, entry_date, entry_time]
//       );
  
//       return res.json({
//         success: true,
//         message: "Vehicle exit recorded successfully",
//         entryDate: `${entryDateDisplay} ${entryTimeDisplay}`,
//         exitDate: `${exitDateDisplay} ${exitTimeDisplay}`,
//         durationHours: durationDecimal,
//         ratePerHour,
//         totalCharge
//       });
  
//     } catch (error) {
//       console.error("Vehicle Exit Error:", error);
//       res.status(500).json({ success: false, message: "Something went wrong during exit process" });
//     }
//   };



// exports.vehicleExit = async (req, res) => {
//     try {
//       const { vehicle_number } = req.body;
  
//       if (!vehicle_number) {
//         return res.status(400).json({ success: false, message: "Vehicle number is required" });
//       }
  
//       // Fetch the latest parking record for this vehicle
//       const vehicleRecord = await executeQuery(
//         `SELECT vehicle_number,
//                 DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date,
//                 entry_time
//          FROM VehicleParkingDetails
//          WHERE vehicle_number = ?
//          ORDER BY entry_date DESC, entry_time DESC
//          LIMIT 1`,
//         [vehicle_number]
//       );
  
//       if (!vehicleRecord || vehicleRecord.length === 0) {
//         return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
//       }
  
//       const { entry_date, entry_time } = vehicleRecord[0];
  
//       // Parse entry into local Date object (IST assumed)
//       const [eYear, eMonth, eDay] = entry_date.split('-').map(Number);
//       const [eHour, eMinute, eSecond] = entry_time.split(':').map(Number);
//       // Construct entry DateTime in local time (avoids UTC parsing issues)
//       const entryDateTime = new Date(eYear, eMonth - 1, eDay, eHour, eMinute, eSecond);
  
//       if (isNaN(entryDateTime.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid entry date/time" });
//       }
  
//       // Current timestamp for exit (local server time, IST)
//       const exitDateTime = new Date();
  
//       // Format entry and exit for display in Indian format
//       const entryDateDisplay = entryDateTime.toLocaleDateString('en-IN');
//       const entryTimeDisplay = entryDateTime.toLocaleTimeString('en-IN', { hour12: false });
//       const exitDateDisplay = exitDateTime.toLocaleDateString('en-IN');
//       const exitTimeDisplay = exitDateTime.toLocaleTimeString('en-IN', { hour12: false });
  
//       // Calculate duration properly
    
      

// const durationMs = exitDateTime - entryDateTime;
// const durationHours = durationMs / (1000 * 60 * 60);
// const totalHoursDecimal = durationHours.toFixed(2);

// const ratePerHour = 60;
// const totalCharge = Math.round(durationHours * ratePerHour); // or use .ceil() if you charge for any started hour

//       console.log("dddd", durationHours);
      
    
//       // Deduct charge from owner balance
//       const updateOwner = await executeQuery(
//         `UPDATE VehicleOwner
//          JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email
//          SET VehicleOwner.amount = VehicleOwner.amount - ?
//          WHERE Vehicle.vehicle_number = ?`,
//         [totalCharge, vehicle_number]
//       );
  
//       if (updateOwner.affectedRows === 0) {
//         return res.status(500).json({ success: false, message: "Failed to deduct balance" });
//       }
  
//       // Prepare exit Date and Time for DB insert
//       const dYear = exitDateTime.getFullYear();
//       const dMonth = String(exitDateTime.getMonth() + 1).padStart(2, '0');
//       const dDay = String(exitDateTime.getDate()).padStart(2, '0');
//       const dHour = String(exitDateTime.getHours()).padStart(2, '0');
//       const dMinute = String(exitDateTime.getMinutes()).padStart(2, '0');
//       const dSecond = String(exitDateTime.getSeconds()).padStart(2, '0');
//       const exitDateDB = `${dYear}-${dMonth}-${dDay}`;
//       const exitTimeDB = `${dHour}:${dMinute}:${dSecond}`;
  
//       await executeQuery(
//         `UPDATE VehicleParkingDetails
//          SET exit_time = ?, exit_date = ?
//          WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
//         [exitTimeDB, exitDateDB, vehicle_number, entry_date, entry_time]
//       );
  
//       return res.json({
//         success: true,
//         message: "Vehicle exit recorded successfully",
//         entryDate: `${entryDateDisplay} ${entryTimeDisplay}`,
//         exitDate: `${exitDateDisplay} ${exitTimeDisplay}`,
//         durationHours: totalHoursDecimal,
//         ratePerHour,
//         totalCharge
//       });
  
//     } catch (error) {
//       console.error("Vehicle Exit Error:", error);
//       res.status(500).json({ success: false, message: "Something went wrong during exit process" });
//     }
//   };
  
  
exports.vehicleExit = async (req, res) => {
    try {
      const { vehicle_number } = req.body;
  
      if (!vehicle_number) {
        return res.status(400).json({ success: false, message: "Vehicle number is required" });
      }
  
      // Fetch the latest parking record for this vehicle
      const vehicleRecord = await executeQuery(
        `SELECT vehicle_number,
                DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date,
                entry_time
         FROM VehicleParkingDetails
         WHERE vehicle_number = ?
         ORDER BY entry_date DESC, entry_time DESC
         LIMIT 1`,
        [vehicle_number]
      );
  
      if (!vehicleRecord || vehicleRecord.length === 0) {
        return res.status(404).json({ success: false, message: "No entry record found for this vehicle" });
      }
  
      const { entry_date, entry_time } = vehicleRecord[0];
  
      // Parse entry date and time into local Date object (IST assumed)
      const [eYear, eMonth, eDay] = entry_date.split('-').map(Number);
      const [eHour, eMinute, eSecond] = entry_time.split(':').map(Number);
      const entryDateTime = new Date(eYear, eMonth - 1, eDay, eHour, eMinute, eSecond);
  
      if (isNaN(entryDateTime.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid entry date/time" });
      }
  
      // Get current local time for exit
      const exitDateTime = new Date();
  
      // Log debug timestamps
      console.log("Entry DateTime:", entryDateTime.toString(), entryDateTime.getTime());
      console.log("Exit DateTime:", exitDateTime.toString(), exitDateTime.getTime());
  
      // Duration calculation in milliseconds
      const durationMs = exitDateTime - entryDateTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      const totalHoursDecimal = durationHours.toFixed(2); // 2 decimal places
  
      // Billing
      const ratePerHour = 6000;
      const totalCharge = Math.round(durationHours * ratePerHour); // Or use Math.ceil() for full-hour billing
  
      // Deduct charge from owner's balance
      const updateOwner = await executeQuery(
        `UPDATE VehicleOwner
         JOIN Vehicle ON VehicleOwner.email = Vehicle.owner_email
         SET VehicleOwner.amount = VehicleOwner.amount - ?
         WHERE Vehicle.vehicle_number = ?`,
        [totalCharge, vehicle_number]
      );
  
      if (updateOwner.affectedRows === 0) {
        return res.status(500).json({ success: false, message: "Failed to deduct balance" });
      }
  
      // Format exit date and time for DB
      const exitDateDB = exitDateTime.toISOString().split('T')[0]; // yyyy-mm-dd
      const exitTimeDB = exitDateTime.toTimeString().split(' ')[0]; // HH:MM:SS
  
      await executeQuery(
        `UPDATE VehicleParkingDetails
         SET exit_time = ?, exit_date = ?
         WHERE vehicle_number = ? AND entry_date = ? AND entry_time = ?`,
        [exitTimeDB, exitDateDB, vehicle_number, entry_date, entry_time]
      );
  
      // Format for response
      const entryDateDisplay = entryDateTime.toLocaleDateString('en-IN');
      const entryTimeDisplay = entryDateTime.toLocaleTimeString('en-IN', { hour12: false });
      const exitDateDisplay = exitDateTime.toLocaleDateString('en-IN');
      const exitTimeDisplay = exitDateTime.toLocaleTimeString('en-IN', { hour12: false });


       
      await executeQuery('DELETE FROM vehicleChecking WHERE vehicle_number = ?', [vehicle_number]);
      await executeQuery('DELETE FROM VehicleParkingDetails WHERE vehicle_number = ?', [vehicle_number]);
      console.log("Vehicle removed from vehicleChecking table");


  
      return res.json({
        success: true,
        message: "Vehicle exit recorded successfully",
        entryDate: `${entryDateDisplay} ${entryTimeDisplay}`,
        exitDate: `${exitDateDisplay} ${exitTimeDisplay}`,
        durationHours: totalHoursDecimal,
        durationMs:durationMs,
        ratePerHour,
        totalCharge
      });
  
    } catch (error) {
      console.error("Vehicle Exit Error:", error);
      res.status(500).json({ success: false, message: "Something went wrong during exit process" });
    }
  };
  




  exports.getAmountByEmail = async (req, res) => {
  try {
    const { email } = req.body;
   console.log("Email is ",email);
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const query = `SELECT amount FROM VehicleOwner WHERE email = ?`;
    const result = await executeQuery(query, [email]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    // Use Math.floor to remove decimal part
    const amount = Math.floor(result[0].amount);

    return res.status(200).json({ success: true, amount:amount });
  } catch (error) {
    console.error("Error fetching amount:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

  
  






