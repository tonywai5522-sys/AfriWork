import { AuthProvider } from '../context/AuthContext.jsx'
import { SocketProvider } from '../context/SocketContext.jsx'
import { NotificationProvider } from '../context/NotificationContext.jsx'
import { BookmarkProvider } from '../context/BookmarkContext.jsx'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <BookmarkProvider>
            {children}
          </BookmarkProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  )
}
