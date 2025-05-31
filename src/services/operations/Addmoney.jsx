import { apiConnector } from "../apiconnector";
import { Payment_api } from "../apis";
import { toast } from "react-hot-toast";
import rzpLogo from "../../assets/logo.png";

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

export const Addmoney = async (email, amount, navigate) => {
    toast.loading("Loading...");

    try {
    
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return;
        }

        
        const options = {
            key: process.env.RAZORPAY_KEY, 
            currency: "INR", 
            amount: `${amount}`, 
            name: "ParkLink", 
            description: "Thank you .", 
            image: rzpLogo, 
            handler: function (response) {
                sendPaymentSuccessEmail(response, amount, email);
                verifyPayment({ ...response, email }, navigate);
            },
        };
        const paymentObject = new window.Razorpay(options);

        paymentObject.open(); 
        paymentObject.on("payment.failed", function (response) {
            toast.error("Oops! Payment Failed.");
            console.log(response.error);
        });
    } catch (error) {
        console.log("Error in Addmoney");
        toast.dismiss();
        toast.error("Network error");
    }
    toast.dismiss();
};

async function verifyPayment(body, navigate) {
    try {
        console.log(body);
        const res = await apiConnector("POST", Payment_api.PAYMENT_VERIFY_API, body);

        console.log(res);
        toast.success("Payment successful...");
        navigate("/dashboard");
    } catch (error) {
        console.log(error);
    }
}

async function sendPaymentSuccessEmail(response, amount, email) {
    try {
        const res = await apiConnector("POST", Payment_api.PAYMENTSUCCESS_API, {
            response: response,
            amount: amount,
            email: email,
        });
        console.log(res);
    } catch (error) {
        console.log(error);
        console.log("Payment successful message could not be sent");
    }
}