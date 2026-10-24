import mongoose from 'mongoose'

const roomMemberSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

roomMemberSchema.index({ roomId: 1, userId: 1 }, { unique: true })
roomMemberSchema.index({ userId: 1, joinedAt: -1 })

export const RoomMember = mongoose.model('RoomMember', roomMemberSchema)
