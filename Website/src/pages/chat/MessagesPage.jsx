import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ConversationList from '../../components/chat/ConversationList.jsx'
import ChatWindow from '../../components/chat/ChatWindow.jsx'
import NewConversationModal from '../../components/chat/NewConversationModal.jsx'

export default function MessagesPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(conversationId || null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showMobileList, setShowMobileList] = useState(!conversationId)

  useEffect(() => {
    if (conversationId) {
      setSelectedId(conversationId)
      setShowMobileList(false)
    }
  }, [conversationId])

  function handleSelect(id) {
    setSelectedId(id)
    setShowMobileList(false)
    navigate(`/messages/${id}`, { replace: true })
  }

  function handleStartNew() {
    setShowNewModal(true)
  }

  function handleConversationCreated(conversation) {
    if (conversation?.id) {
      setSelectedId(conversation.id)
      setShowMobileList(false)
      navigate(`/messages/${conversation.id}`, { replace: true })
    }
  }

  function handleBack() {
    setSelectedId(null)
    setShowMobileList(true)
    navigate('/messages', { replace: true })
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className={`w-full shrink-0 border-r-2 border-slate-200 bg-white md:w-80 lg:w-96 ${
        showMobileList || !selectedId ? 'block' : 'hidden md:block'
      }`}>
        <ConversationList
          selectedId={selectedId}
          onSelect={handleSelect}
          onStartNew={handleStartNew}
        />
      </div>
      <div className={`flex-1 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
        <ChatWindow
          conversationId={selectedId}
          onBack={handleBack}
        />
      </div>

      <NewConversationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
