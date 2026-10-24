import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Filled by realtime sync later; empty for new rooms
    savedCode: { type: String, default: '' },
  },
  { timestamps: true },
)

export const Room = mongoose.model('Room', roomSchema)
