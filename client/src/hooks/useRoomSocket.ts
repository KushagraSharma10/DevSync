import { useEffect, useRef, useState } from 'react'
import { getSocket, disconnectSocket } from '../lib/socket'
import { threeWayMerge } from '../lib/textMerge'
import type { ChatMessage, Participant } from '../types/room'

type PresencePayload = {
  participants: Array<{ id: string; name: string }>
}

type CodePayload = {
  content: string
  rev?: number
}

type ChatNewPayload = {
  message: ChatMessage
}

type JoinAck = {
  ok: boolean
  message?: string
  participants?: Array<{ id: string; name: string }>
  content?: string
  rev?: number
  messages?: ChatMessage[]
}

type SyncAck = {
  ok: boolean
  message?: string
  content?: string
  rev?: number
}

type CodeUpdateAck = {
  ok: boolean
  message?: string
  content?: string
  rev?: number
  error?: string
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
  /** Current editor text — used to 3-way-merge remote updates (C1). */
  getLocalContent: () => string
  onRemoteCode?: (content: string) => void
}

export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting'

const CODE_EMIT_DEBOUNCE_MS = 80

/** Map Socket.IO internals (xhr poll error, etc.) to plain language. */
function friendlyConnectError(error: Error, isReconnect: boolean): string {
  // Reconnecting banner already explains the situation — skip a second technical alert
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
 * Room socket: presence (RT1) + code sync (RT2) + chat (RT3).
 * Editor text stays in the page — this hook only pipes socket events.
 */
export function useRoomSocket({
  roomCode,
  token,
  currentUserId,
  enabled,
  getLocalContent,
  onRemoteCode,
}: UseRoomSocketOptions) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting')
  const [socketError, setSocketError] = useState('')

  const onRemoteCodeRef = useRef(onRemoteCode)
  const getLocalContentRef = useRef(getLocalContent)
  const emitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)
  const hadConnectedRef = useRef(false)
  /** Last server-authoritative snapshot we accepted. */
  const syncedRef = useRef<{ content: string; rev: number }>({
    content: '',
    rev: 0,
  })
  const emitCodeUpdateRef = useRef<(content: string) => void>(() => {})

  useEffect(() => {
    onRemoteCodeRef.current = onRemoteCode
  }, [onRemoteCode])

  useEffect(() => {
    getLocalContentRef.current = getLocalContent
  }, [getLocalContent])

  useEffect(() => {
    if (!enabled || !token || !roomCode) {
      return
    }

    const socket = getSocket(token)
    socketRef.current = socket
    let cancelled = false
    hadConnectedRef.current = false
    syncedRef.current = { content: '', rev: 0 }

    // Defer reset so we don't sync-setState in the effect body (eslint)
    const resetTimer = setTimeout(() => {
      if (cancelled) return
      setConnectionStatus('connecting')
      setMessages([])
    }, 0)

    function ingestRemote(content: string, rev: number) {
      if (rev < syncedRef.current.rev) return
      // Same rev + same text: ignore. Same rev shouldn't rewrite with different text.
      if (rev === syncedRef.current.rev && content === syncedRef.current.content) {
        return
      }

      const base = syncedRef.current.content
      const local = getLocalContentRef.current()
      const merged = threeWayMerge(base, local, content)

      syncedRef.current = { content, rev }
      onRemoteCodeRef.current?.(merged)

      // Local-only edits remain after merge — push them on top of the new rev.
      if (merged !== content) {
        emitCodeUpdateRef.current(merged)
      }
    }

    function handlePresence(payload: PresencePayload) {
      if (cancelled) return
      setParticipants(withYouFlag(payload.participants ?? [], currentUserId))
    }

    function handleCodeUpdate(payload: CodePayload) {
      if (cancelled) return
      if (typeof payload?.content !== 'string') return
      const rev = typeof payload.rev === 'number' ? payload.rev : syncedRef.current.rev + 1
      ingestRemote(payload.content, rev)
    }

    function handleCodeSync(payload: CodePayload) {
      if (cancelled) return
      if (typeof payload?.content !== 'string') return
      const rev = typeof payload.rev === 'number' ? payload.rev : syncedRef.current.rev
      ingestRemote(payload.content, rev)
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

        if (typeof ack.content === 'string') {
          const rev = typeof ack.rev === 'number' ? ack.rev : 0
          // Join/resync: treat server copy as base (overwrite local seed).
          syncedRef.current = { content: ack.content, rev }
          onRemoteCodeRef.current?.(ack.content)
        } else {
          socket.emit(
            'code:request_sync',
            { code: roomCode },
            (syncAck: SyncAck) => {
              if (cancelled) return
              if (syncAck?.ok && typeof syncAck.content === 'string') {
                const rev = typeof syncAck.rev === 'number' ? syncAck.rev : 0
                syncedRef.current = { content: syncAck.content, rev }
                onRemoteCodeRef.current?.(syncAck.content)
              }
            },
          )
        }
      })
    }

    function handleDisconnect() {
      if (cancelled) return
      if (hadConnectedRef.current) {
        setConnectionStatus('reconnecting')
        setSocketError('') // soft banner only — no tech jargon
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
    socket.on('code:update', handleCodeUpdate)
    socket.on('code:sync', handleCodeSync)
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
      if (emitTimerRef.current) {
        clearTimeout(emitTimerRef.current)
        emitTimerRef.current = null
      }
      socket.off('presence:update', handlePresence)
      socket.off('code:update', handleCodeUpdate)
      socket.off('code:sync', handleCodeSync)
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

  function emitCodeUpdate(content: string) {
    if (emitTimerRef.current) clearTimeout(emitTimerRef.current)
    emitTimerRef.current = setTimeout(() => {
      emitTimerRef.current = null
      const socket = socketRef.current
      if (!socket?.connected) return

      const baseRev = syncedRef.current.rev
      socket.emit(
        'code:update',
        { content, baseRev },
        (ack: CodeUpdateAck) => {
          if (!ack) return

          if (ack.ok && typeof ack.rev === 'number') {
            syncedRef.current = {
              content: typeof ack.content === 'string' ? ack.content : content,
              rev: ack.rev,
            }
            const local = getLocalContentRef.current()
            if (local !== syncedRef.current.content) {
              emitCodeUpdate(local)
            }
            return
          }

          // Stale or rejected — merge server copy and retry if we still differ.
          if (
            typeof ack.content === 'string' &&
            typeof ack.rev === 'number'
          ) {
            const base = syncedRef.current.content
            const local = getLocalContentRef.current()
            const merged = threeWayMerge(base, local, ack.content)
            syncedRef.current = { content: ack.content, rev: ack.rev }
            onRemoteCodeRef.current?.(merged)
            if (merged !== ack.content) {
              emitCodeUpdate(merged)
            }
          }
        },
      )
    }, CODE_EMIT_DEBOUNCE_MS)
  }

  emitCodeUpdateRef.current = emitCodeUpdate

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
      // Successful send arrives via chat:new (including to sender) — no local duplicate
    })
  }

  return {
    participants,
    messages,
    connectionStatus,
    isConnected: connectionStatus === 'live',
    socketError,
    emitCodeUpdate,
    emitChatMessage,
  }
}
