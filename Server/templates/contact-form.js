const orderTemplate =(address,houseno,contactnumber)=>{


    return  `<!DOCTYPE html>
    <html>
        <body>
            <h2>Contact Details</h2>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>House No:</strong> ${houseno}</p>
            <p><strong>Mobile No:</strong> ${contactnumber}</p>
        </body>
    </html>
`;
};


module.exports=orderTemplate