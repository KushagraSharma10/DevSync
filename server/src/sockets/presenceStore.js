/** @typedef {{ userId: string, name: string }} PresenceMember */

/** roomCode → (socketId → member) */
const rooms = new Map()

export function addMember(roomCode, socketId, member) {
  let members = rooms.get(roomCode)
  if (!members) {
    members = new Map()
    rooms.set(roomCode, members)
  }
  members.set(socketId, member)
}

export function removeMember(roomCode, socketId) {
  const members = rooms.get(roomCode)
  if (!members) return
  members.delete(socketId)
  if (members.size === 0) {
    rooms.delete(roomCode)
  }
}

/** All Socket.IO room codes this socket is tracked in. */
export function removeSocketFromAll(socketId) {
  const leftCodes = []
  for (const [roomCode, members] of rooms.entries()) {
    if (members.has(socketId)) {
      members.delete(socketId)
      leftCodes.push(roomCode)
      if (members.size === 0) {
        rooms.delete(roomCode)
      }
    }
  }
  return leftCodes
}

/** Unique users in a room (two tabs for same user → one list entry). */
export function listParticipants(roomCode) {
  const members = rooms.get(roomCode)
  if (!members) return []

  const byUser = new Map()
  for (const member of members.values()) {
    byUser.set(member.userId, {
      id: member.userId,
      name: member.name,
    })
  }
  return [...byUser.values()]
}
