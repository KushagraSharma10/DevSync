import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never returned by default — queries must opt in with .select('+passwordHash')
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)
