import { Schema, model, Document } from "mongoose";

export type Role = "student" | "organizer" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "organizer", "admin"],
      default: "student",
      index: true,
    },
    avatarUrl: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
