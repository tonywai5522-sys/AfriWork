export function sendSuccess(res, data, message = 'Success') {
  return res.status(200).json({ success: true, message, data })
}

export function sendError(res, message = 'Error', status = 400) {
  return res.status(status).json({ success: false, message })
}
