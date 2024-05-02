import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB Connect Successfully, DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("MONGODB ERROR!! : ", error);
        process.exit(1)
    }
}
export default connectDb