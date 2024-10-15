import mongoose from "mongoose";

const { Schema } = mongoose;

const ENuserSchema = new Schema(
  {
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
    plan: {
      type: String,
    },
    credits: {
      type: Number,
    },
    trial_period_days: {
      type: Number,
    },
    setup: {
      type: Number,
    },
    short_insta_code: {
      type: String,
    },
    short_insta_access_token: {
      type: String,
    },
    short_insta_user_id: {
      type: String,
    },
    user_insta_permissions: {
      type: String,
    },
    long_insta_access_token: {
      type: String,
    },
    long_insta_access_token_createdAt: {
      type: Date,
    },
    token_type: {
      type: String,
    },
    long_insta_access_token_expires_in: {
      type: Number,
    },
    subscription: {
      type: JSON,
    },
  },
  { timestamps: true }
);

const ENuser = mongoose.models.Memberships || mongoose.model("en_user", ENuserSchema);
export default ENuser;