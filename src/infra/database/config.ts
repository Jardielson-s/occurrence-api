import mongoose from "mongoose";

export const mongoDB = async (): Promise<mongoose.Mongoose> => {
  await mongoose.connect(`${process.env.MONGO_URI}`);

  console.log(`Connected Mongo URI: ${process.env.MONGO_URI}`);

  return mongoose;
};
