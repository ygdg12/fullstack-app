 import axois from  "axois"

 export const axoisInstance = axois.create({
    baseURL :import.meta.env.MODE == "development"? "http://localhost:5001/api":"/api",
    withCredentials:true,
 })