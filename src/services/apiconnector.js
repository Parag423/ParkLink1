import axios from "axios"

export const axiosInstance=axios.create({});

export const apiConnector=(method,url,data,header,param)=>{
    const result=  axiosInstance({
        method:method,
        url:url,
        data:data?data:null,
        Headers:header?header:null,
        params:param?param:null,
    })


    return result;
}

