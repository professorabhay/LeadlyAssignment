import dotenv from "dotenv"
import connectDB from "./db/connection";
import { app } from "./app";

dotenv.config({
    path: './.env'
});

console.log("PORT:", process.env.PORT);

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

