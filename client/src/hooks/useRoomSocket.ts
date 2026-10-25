import { useEffect, useRef, useState } from 'react'
import { getSocket, disconnectSocket } from '../lib/socket'
import type { Participant } from '../types/room'

type PresencePayload = {
  participants: Array<{ id: string; name: string }>
}

type CodePayload = {
  content: string
}

type JoinAck = {
  ok: boolean
  message?: string
  participants?: Array<{ id: string; name: string }>
  content?: string
}

type SyncAck = {
  ok: boolean
  message?: string
  content?: string
}

type UseRoomSocketOptions = {
  roomCode: string
  token: string | null
  currentUserId: string | null
  /** Only connect after the REST room load succeeded */
  enabled: boolean
  /** Apply remote / sync snapshots into local editor state (not Zustand) */
  onRemoteCode?: (content: string) => void
}

const CODE_EMIT_DEBOUNCE_MS = 80

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
 * Room socket: presence (RT1) + live code sync (RT2).
 * Editor text stays in the page — this hook only pipes socket events.
 */
export function useRoomSocket({
  roomCode,
  token,
  currentUserId,
  enabled,
  onRemoteCode,
}: UseRoomSocketOptions) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [socketError, setSocketError] = useState('')

  const onRemoteCodeRef = useRef(onRemoteCode)
  const emitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  useEffect(() => {
    onRemoteCodeRef.current = onRemoteCode
  }, [onRemoteCode])

  useEffect(() => {
    if (!enabled || !token || !roomCode) {
      return
    }

    const socket = getSocket(token)
    socketRef.current = socket
    let cancelled = false

    function applyRemote(content: string) {
      onRemoteCodeRef.current?.(content)
    }

    function handlePresence(payload: PresencePayload) {
      if (cancelled) return
      setParticipants(withYouFlag(payload.participants ?? [], currentUserId))
    }

    function handleCodeUpdate(payload: CodePayload) {
      if (cancelled) return
      if (typeof payload?.content !== 'string') return
      applyRemote(payload.content)
    }

    function handleCodeSync(payload: CodePayload) {
      if (cancelled) return
      if (typeof payload?.content !== 'string') return
      applyRemote(payload.content)
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
        // Prefer live server snapshot (may be newer than REST savedCode)
        if (typeof ack.content === 'string') {
          applyRemote(ack.content)
        } else {
          socket.emit(
            'code:request_sync',
            { code: roomCode },
            (syncAck: SyncAck) => {
              if (cancelled) return
              if (syncAck?.ok && typeof syncAck.content === 'string') {
                applyRemote(syncAck.content)
              }
            },
          )
        }
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
    socket.on('code:update', handleCodeUpdate)
    socket.on('code:sync', handleCodeSync)
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
      if (emitTimerRef.current) {
        clearTimeout(emitTimerRef.current)
        emitTimerRef.current = null
      }
      socket.off('presence:update', handlePresence)
      socket.off('code:update', handleCodeUpdate)
      socket.off('code:sync', handleCodeSync)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)

      if (socket.connected) {
        socket.emit('room:leave', { code: roomCode })
      }
      socketRef.current = null
      disconnectSocket()
    }
  }, [enabled, token, roomCode, currentUserId])

  function emitCodeUpdate(content: string) {
    if (emitTimerRef.current) clearTimeout(emitTimerRef.current)
    emitTimerRef.current = setTimeout(() => {
      emitTimerRef.current = null
      const socket = socketRef.current
      if (!socket?.connected) return
      socket.emit('code:update', { content })
    }, CODE_EMIT_DEBOUNCE_MS)
  }

  return { participants, isConnected, socketError, emitCodeUpdate }
}
