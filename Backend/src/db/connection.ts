import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log("DB Connected" + connection.connection.host);
    } catch (error) {
        console.log("Coonection Failed to db ", error)
        process.exit(1)
    }
}

export default connectDB;