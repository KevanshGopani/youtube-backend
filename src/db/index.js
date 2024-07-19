import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDatabase = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
    if (connectionInstance) {
      console.log(`Mongodb connected successfully`);
    }
  } catch (error) {
    console.error("Mongodb connection error", error);
    process.exit(1);
  }
};

export default connectDatabase;
