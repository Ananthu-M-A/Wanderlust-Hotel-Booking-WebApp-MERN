import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { UserType } from '../types/types';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isBlocked: { type: Boolean, required: true },
    role: [{ type: String, required: true }],
    imageUrl: {type: String, required: false},
});

userSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
})

const User = mongoose.model<UserType>("User", userSchema);

export default User;