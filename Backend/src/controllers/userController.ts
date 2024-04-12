import { User } from "../models/userModal";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from 'express';

const generateAccessAndRefereshTokens = async(userId: any) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new error;
    }
}

const registerUser = async (req: Request, res: Response, next: any) => {
    const {name, email, password} = req.body
    if(
        [name, email, password].some((field) => field?.trim() === "")
    ) {
        return res.status(400).send("All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}]
    })

    if (existedUser) {
        return res.status(409).send( "User exist with email")
    }

    const user = await User.create({
        name, email, password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        return res.status(400).send("Something went wrong while creating User");
    }

    return res
    .status(201)
    .json({ message: "User created Successfully" })
}

const loginUser = async(req: Request, res: Response) => {
    const {email, password} = req.body;
    if(!email){
        return res.status(400).send("Email is required");
    }

    const user = await User.findOne({
        $or: [{email}]
    })

    if(!user){
        return res.status(404).send("User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        return res.status(401).send("Invalid Credentials");
    }

    const{accessToken, refreshToken} = await
    generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ message: "User logged In Successfully" });
}

interface AuthenticatedRequest extends Request {
    user: {
        _id: string;
    };
}

const logoutUser = async(req: AuthenticatedRequest, res: Response) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out" });
}

const refreshAccessToken = async(req: any, res: any) => {
    const incomingRefreshToken  = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        return res.status(401).send("unauthorized request");
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )as JwtPayload;

        const user = await User.findById(decodedToken?._id)

        if(!user){
            res.send(401, "Invalid Refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            res.send(401, "Invalid Refresh Token")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
        const newRefreshToken = refreshToken;generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json({ message: "Access token refreshed" });
    } catch (error) {
        return res.status(401).send(error?.message || "Invalid refresh token");
    }
}

const getCurrentUser = async (req: any, res: any) => {
    return res
    .status(200)
    .json({ user: req.user, message: "User Fetched Successfully" });
}

const updateAccountDetails = async(req: any, res: any) => {
    const { name, email } = req.body;

    if(!name || !email){
        return res.status(400).send("All fields required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                name,
                email:email 
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json({message: "Accound Details Updated"})
}

export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
}