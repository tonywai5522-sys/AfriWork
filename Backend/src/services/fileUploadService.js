import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = 'uploads/chat'

// Create upload directory if it doesn't exist
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch { /* dir exists */ }
}
ensureUploadDir()

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'application/zip', 'application/x-rar-compressed',
]

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`
    cb(null, name)
  },
})

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

export const singleFile = upload.single('file')
export const multiFile = upload.array('files', 5)

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath)
  } catch { /* file may not exist */ }
}

export function getFileUrl(filename) {
  return `/${UPLOAD_DIR}/${filename}`
}

export function formatFileInfo(file) {
  return {
    id: `att_${Date.now()}`,
    name: file.originalname,
    url: getFileUrl(file.filename),
    type: file.mimetype,
    size: file.size,
  }
}
