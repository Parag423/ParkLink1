const express=require('express')

const router=express.Router()

// ,signUp,,deleteAccount
const{sendOTP, signUp, login, caradd, findNearestParkingLots,updateParkingAvailability, bookParkingLot, getesp32id,cancelBooking, addlot, approve, lotsdetails,createorder,verifypayment, getAmountByEmail }=require("../controllers/auth")
const{checkVehicleAndRoute}=require("../controllers/auth2");


router.post("/login",login)
router.post("/signup",signUp)
router.post("/sendOtp",sendOTP)

router.post("/caradd", caradd)

router.post("/findparking",findNearestParkingLots )

router.post("/bookparking", bookParkingLot);


router.post("/getesp32id",getesp32id);


router.post("/cancelBooking", cancelBooking)


router.post("/data",updateParkingAvailability)


router.post("/addlot", addlot)

router.post("/approve",approve)

router.post("/lotsdetails",lotsdetails)


router.post("/create-order",createorder);


router.post("/verify-payment",verifypayment);


router.post("/carscan", checkVehicleAndRoute);


router.post("/getamount", getAmountByEmail)





// router.post("/deleteAccount", deleteAccount)


module.exports=router