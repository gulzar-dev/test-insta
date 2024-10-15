import mongoose from "mongoose";

const { Schema } = mongoose;

const LogsSchema = new Schema(
  {
    createdAt: {
        type: Date,      
    },
    firstName: {
      type: String,      
    },
    lastName: {
      type: String,      
    },
    emailAddress: {
      type: String,
    },
    userId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    eventType: {
      type: String,
    },
    eventData: {
      type: JSON,
    },
  },
  { timestamps: true }
);

const userlogs = mongoose.models.Logs || mongoose.model("user_logs", LogsSchema);
export default userlogs;