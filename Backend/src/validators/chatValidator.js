export function validateCreateConversation(data) {
  const errors = []
  if (!data.type || !['direct', 'group'].includes(data.type)) {
    errors.push('Conversation type must be "direct" or "group"')
  }
  if (!data.participants || !Array.isArray(data.participants) || data.participants.length === 0) {
    errors.push('At least one participant is required')
  }
  return { valid: errors.length === 0, errors }
}

export function validateCreateGroup(data) {
  const errors = []
  if (!data.title || !data.title.trim()) {
    errors.push('Group title is required')
  }
  if (!data.participants || !Array.isArray(data.participants) || data.participants.length < 2) {
    errors.push('At least 2 participants are required for a group')
  }
  return { valid: errors.length === 0, errors }
}

export function validateSendMessage(data) {
  const errors = []
  if (!data.conversationId) {
    errors.push('conversationId is required')
  }
  if ((!data.content || !data.content.trim()) && (!data.attachments || data.attachments.length === 0)) {
    errors.push('Message must have content or attachments')
  }
  return { valid: errors.length === 0, errors }
}
