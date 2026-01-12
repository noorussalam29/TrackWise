import {io} from 'socket.io-client'

let socket = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5

const getSocketURL = () => {
  const baseURL = import.meta.env.VITE_API_URL
  if (baseURL) {
    return baseURL.replace('/api', '')
  }
  return 'http://localhost:4000'
}

export const initSocket = (userId) => {
  if (socket?.connected) {
    console.log('Socket already connected')
    return socket
  }

  try {
    socket = io(getSocketURL(), {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('✓ Socket connected:', socket.id)
      reconnectAttempts = 0
      if (userId) {
        socket.emit('join-user-room', userId)
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('✗ Socket disconnected:', reason)
    })

    socket.on('reconnect_attempt', () => {
      reconnectAttempts++
      console.log(`Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    socket.on('connect_error', (error) => {
      console.warn('Connection error:', error?.message)
    })
  } catch (error) {
    console.error('Failed to initialize socket:', error)
  }

  return socket
}

export const getSocket = () => socket

export const isSocketConnected = () => socket?.connected || false

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    reconnectAttempts = 0
  }
}

// ===== ATTENDANCE LISTENERS =====
export const onAttendanceRefresh = (callback) => {
  if (!socket) return () => {}
  socket.on('attendance-refresh', callback)
  return () => socket?.off('attendance-refresh', callback)
}

export const onAdminAttendanceUpdate = (callback) => {
  if (!socket) return () => {}
  socket.on('admin-attendance-update', callback)
  return () => socket?.off('admin-attendance-update', callback)
}

export const onDashboardUpdate = (callback) => {
  if (!socket) return () => {}
  socket.on('dashboard-update', callback)
  return () => socket?.off('dashboard-update', callback)
}

// ===== TASK LISTENERS =====
export const onTaskRefresh = (callback) => {
  if (!socket) return () => {}
  socket.on('task-refresh', callback)
  return () => socket?.off('task-refresh', callback)
}

export const onTaskStatusUpdate = (callback) => {
  if (!socket) return () => {}
  socket.on('task-status-update', callback)
  return () => socket?.off('task-status-update', callback)
}

// ===== NOTIFICATIONS =====
export const onNotification = (callback) => {
  if (!socket) return () => {}
  socket.on('notification', callback)
  return () => socket?.off('notification', callback)
}

// ===== EMITTERS =====
export const emitAttendanceUpdate = (data) => {
  if (socket?.connected) {
    socket.emit('attendance-updated', data)
  }
}

export const emitTaskUpdate = (data) => {
  if (socket?.connected) {
    socket.emit('task-updated', data)
  }
}

export const emitDashboardSync = (userId) => {
  if (socket?.connected) {
    socket.emit('sync-dashboard', { userId })
  }
}

// ===== PING/KEEP ALIVE =====
export const emitPing = () => {
  if (socket?.connected) {
    socket.emit('ping')
  }
}

export const onPong = (callback) => {
  if (!socket) return () => {}
  socket.on('pong', callback)
  return () => socket?.off('pong', callback)
}
