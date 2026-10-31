import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { getSocket, disconnectSocket } from '../lib/socket'
import { b64ToU8, u8ToB64 } from '../lib/yjsBinary'
import type { ChatMessage, Participant } from '../types/room'

type PresencePayload = {
  participants: Array<{ id: string; name: string }>
}

type ChatNewPayload = {
  message: ChatMessage
}

type JoinAck = {
  ok: boolean
  message?: string
  participants?: Array<{ id: string; name: string }>
  yjsState?: string | null
  messages?: ChatMessage[]
}

type YjsSyncAck = {
  ok: boolean
  message?: string
  update?: string
  stateVector?: string
}

type ChatSendAck = {
  ok: boolean
  message?: string | ChatMessage
}

type UseRoomSocketOptions = {
  roomCode: string
  token: string | null
  currentUserId: string | null
  enabled: boolean
}

export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting'

const YTEXT_KEY = 'monaco'

/** Map Socket.IO internals (xhr poll error, etc.) to plain language. */
function friendlyConnectError(error: Error, isReconnect: boolean): string {
  if (isReconnect) return ''

  const raw = (error.message || '').toLowerCase()
  if (
    raw.includes('xhr poll') ||
    raw.includes('websocket') ||
    raw.includes('transport') ||
    raw.includes('timeout') ||
    raw.includes('econnrefused')
  ) {
    return "Can't reach the live server. Check your connection — we'll keep trying."
  }
  if (
    raw.includes('auth') ||
    raw.includes('token') ||
    raw.includes('unauthorized') ||
    raw.includes('jwt')
  ) {
    return 'Your session expired. Please log in again.'
  }
  return "Can't connect to the live room right now. We'll keep trying."
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
 * Room socket: presence + Yjs code sync + chat.
 * Keeps one Y.Doc for the room lifetime so offline edits survive reconnect (M2).
 */
export function useRoomSocket({
  roomCode,
  token,
  currentUserId,
  enabled,
}: UseRoomSocketOptions) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting')
  const [socketError, setSocketError] = useState('')
  const [ytext, setYtext] = useState<Y.Text | null>(null)

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)
  const hadConnectedRef = useRef(false)
  const ydocRef = useRef<Y.Doc | null>(null)
  const syncedOnceRef = useRef(false)

  useEffect(() => {
    if (!enabled || !token || !roomCode) {
      return
    }

    const socket = getSocket(token)
    socketRef.current = socket
    let cancelled = false
    hadConnectedRef.current = false
    syncedOnceRef.current = false

    const ydoc = new Y.Doc()
    const text = ydoc.getText(YTEXT_KEY)
    ydocRef.current = ydoc
    setYtext(text)

    const onLocalUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === 'remote' || origin === 'load') return
      if (!socket.connected) return
      socket.emit('yjs:update', { update: u8ToB64(update) })
    }
    ydoc.on('update', onLocalUpdate)

    const resetTimer = setTimeout(() => {
      if (cancelled) return
      setConnectionStatus('connecting')
      setMessages([])
    }, 0)

    function applyRemoteUpdate(b64: string) {
      const bytes = b64ToU8(b64)
      Y.applyUpdate(ydoc, bytes, 'remote')
    }

    function runVectorSync() {
      socket.emit(
        'yjs:sync',
        { stateVector: u8ToB64(Y.encodeStateVector(ydoc)) },
        (ack: YjsSyncAck) => {
          if (cancelled || !ack?.ok) return
          if (typeof ack.update === 'string' && ack.update.length > 0) {
            applyRemoteUpdate(ack.update)
          }
          if (typeof ack.stateVector === 'string') {
            const missing = Y.encodeStateAsUpdate(ydoc, b64ToU8(ack.stateVector))
            if (missing.byteLength > 2 && socket.connected) {
              socket.emit('yjs:update', { update: u8ToB64(missing) })
            }
          }
        },
      )
    }

    function handlePresence(payload: PresencePayload) {
      if (cancelled) return
      setParticipants(withYouFlag(payload.participants ?? [], currentUserId))
    }

    function handleYjsUpdate(payload: { update?: string }) {
      if (cancelled) return
      if (typeof payload?.update !== 'string' || !payload.update) return
      applyRemoteUpdate(payload.update)
    }

    function handleChatNew(payload: ChatNewPayload) {
      if (cancelled) return
      const next = payload?.message
      if (!next?.id) return
      setMessages((prev) => {
        if (prev.some((message) => message.id === next.id)) return prev
        return [...prev, next]
      })
    }

    function handleConnect() {
      if (cancelled) return
      setSocketError('')
      socket.emit('room:join', { code: roomCode }, (ack: JoinAck) => {
        if (cancelled) return
        if (!ack?.ok) {
          setSocketError(ack?.message ?? 'Unable to join the live room.')
          setParticipants([])
          setMessages([])
          setConnectionStatus(
            hadConnectedRef.current ? 'reconnecting' : 'connecting',
          )
          return
        }

        hadConnectedRef.current = true
        setConnectionStatus('live')
        setParticipants(withYouFlag(ack.participants ?? [], currentUserId))
        setMessages(Array.isArray(ack.messages) ? ack.messages : [])

        if (!syncedOnceRef.current) {
          if (typeof ack.yjsState === 'string' && ack.yjsState.length > 0) {
            applyRemoteUpdate(ack.yjsState)
          }
          syncedOnceRef.current = true
        } else {
          // Reconnect: merge offline local edits with server (M2)
          runVectorSync()
        }
      })
    }

    function handleDisconnect() {
      if (cancelled) return
      if (hadConnectedRef.current) {
        setConnectionStatus('reconnecting')
        setSocketError('')
      } else {
        setConnectionStatus('connecting')
      }
    }

    function handleConnectError(error: Error) {
      if (cancelled) return
      const isReconnect = hadConnectedRef.current
      setConnectionStatus(isReconnect ? 'reconnecting' : 'connecting')
      setSocketError(friendlyConnectError(error, isReconnect))
    }

    socket.on('presence:update', handlePresence)
    socket.on('yjs:update', handleYjsUpdate)
    socket.on('chat:new', handleChatNew)
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
      clearTimeout(resetTimer)
      ydoc.off('update', onLocalUpdate)
      ydoc.destroy()
      ydocRef.current = null
      setYtext(null)

      socket.off('presence:update', handlePresence)
      socket.off('yjs:update', handleYjsUpdate)
      socket.off('chat:new', handleChatNew)
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

  function emitChatMessage(text: string) {
    const socket = socketRef.current
    if (!socket?.connected) return

    socket.emit('chat:send', { text }, (ack: ChatSendAck) => {
      if (!ack?.ok) {
        setSocketError(
          typeof ack?.message === 'string'
            ? ack.message
            : 'Unable to send message.',
        )
      }
    })
  }

  return {
    participants,
    messages,
    connectionStatus,
    isConnected: connectionStatus === 'live',
    socketError,
    ytext,
    emitChatMessage,
  }
}
