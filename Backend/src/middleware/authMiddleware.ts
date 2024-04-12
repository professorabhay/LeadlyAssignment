import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/userModal";

export const verifyJWT = async(req: any, res: any, next: any) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer:", "")

        if(!token){
            return res.status(401).send("Unauthorized Request")
        }

        const decodedToken =  jwt.verify(token, process.env.Access_TOKEN_SECRET) as JwtPayload;

        const user = await User.findById(decodedToken?._id).select
        ("-password -refreshToken");

        if(!user){
            return res.status(401).send("Invalid Token")
        }

        req.user = user;
        next()
    } catch (error) {
        return res.status(401).send(error?.message || "Invalid access token")
    }
} 