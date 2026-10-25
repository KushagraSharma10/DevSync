import { useEffect, useState } from 'react'
import { getSocket, disconnectSocket } from '../lib/socket'
import type { Participant } from '../types/room'

type PresencePayload = {
  participants: Array<{ id: string; name: string }>
}

type JoinAck = {
  ok: boolean
  message?: string
  participants?: Array<{ id: string; name: string }>
}

type UseRoomSocketOptions = {
  roomCode: string
  token: string | null
  currentUserId: string | null
  /** Only connect after the REST room load succeeded */
  enabled: boolean
}

function withYouFlag(
  list: Array<{ id: string; name: string }>,
  currentUserId: string | null,
): Participant[] {
  return list.map((participant) => ({
    ...participant,
    isYou: Boolean(currentUserId && participant.id === currentUserId),
  }))
}

/**
 * Joins the Socket.IO room for presence while the Room page is open.
 * Cleans up on leave / unmount (room:leave + disconnect).
 */
export function useRoomSocket({
  roomCode,
  token,
  currentUserId,
  enabled,
}: UseRoomSocketOptions) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [socketError, setSocketError] = useState('')

  useEffect(() => {
    if (!enabled || !token || !roomCode) {
      return
    }

    const socket = getSocket(token)
    let cancelled = false

    function handlePresence(payload: PresencePayload) {
      if (cancelled) return
      setParticipants(withYouFlag(payload.participants ?? [], currentUserId))
    }

    function handleConnect() {
      if (cancelled) return
      setIsConnected(true)
      setSocketError('')
      socket.emit('room:join', { code: roomCode }, (ack: JoinAck) => {
        if (cancelled) return
        if (!ack?.ok) {
          setSocketError(ack?.message ?? 'Unable to join the live room.')
          setParticipants([])
          return
        }
        setParticipants(withYouFlag(ack.participants ?? [], currentUserId))
      })
    }

    function handleDisconnect() {
      if (cancelled) return
      setIsConnected(false)
    }

    function handleConnectError(error: Error) {
      if (cancelled) return
      setIsConnected(false)
      setSocketError(error.message || 'Unable to connect to the live server.')
    }

    socket.on('presence:update', handlePresence)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)

    if (socket.connected) {
      handleConnect()
    } else {
      socket.connect()
    }

    return () => {
      cancelled = true
      socket.off('presence:update', handlePresence)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)

      if (socket.connected) {
        socket.emit('room:leave', { code: roomCode })
      }
      disconnectSocket()
    }
  }, [enabled, token, roomCode, currentUserId])

  return { participants, isConnected, socketError }
}
