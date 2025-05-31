const BASE_URL = process.env.REACT_APP_BASE_URL;

console.log("hello",BASE_URL);
export const auth_api={
   
    SENDOTP_API:BASE_URL+"/sendOtp",
    SIGNUP_API:BASE_URL+"/signup",
    LOGIN_API:BASE_URL+"/login"
}

export const vehicle_api ={
    CARADD_API:BASE_URL+"/caradd",
    FINDPARKING_API:BASE_URL+"/findparking",
    BOOKPARKING_API:BASE_URL+"/bookparking",
    UNBOOKPARKING_API:BASE_URL+"/cancelBooking",
    GETESP32:BASE_URL+"/getesp32id"
}

export const parking_api={
    LOTADD_API:BASE_URL+"/addlot",
    LOTSDETAILS:BASE_URL+"/lotsdetails"
}

export const Payment_api={
    
    CREATE_ORDER_API:BASE_URL+"/create-order",
    VERIFY_PAYMENT_API:BASE_URL+"/verify-payment",
}


