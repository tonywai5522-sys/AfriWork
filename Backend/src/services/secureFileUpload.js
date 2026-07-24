import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger.js'

const UPLOAD_BASE = 'uploads'
const UPLOAD_DIRS = {
  chat: 'uploads/chat',
  avatars: 'uploads/avatars',
  resumes: 'uploads/resumes',
  documents: 'uploads/documents',
  portfolio: 'uploads/portfolio',
  logos: 'uploads/logos',
  verification: 'uploads/verification',
}

// Magic bytes for file type verification
const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'application/zip': [0x50, 0x4B, 0x03, 0x04],
  'application/x-rar-compressed': [0x52, 0x61, 0x72, 0x21],
}

const MIME_CONFIG = {
  chat: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip', 'application/x-rar-compressed',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  },
  avatars: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1,
  },
  resumes: {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
  },
  documents: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 10,
  },
  portfolio: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSize: 15 * 1024 * 1024,
    maxFiles: 20,
  },
  logos: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxSize: 2 * 1024 * 1024,
    maxFiles: 1,
  },
  verification: {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
  },
}

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.vbs', '.sh', '.php', '.asp', '.aspx', '.jsp', '.cgi', '.pl', '.py', '.rb']

async function ensureUploadDirs() {
  for (const dir of Object.values(UPLOAD_DIRS)) {
    try { await fs.mkdir(dir, { recursive: true }) } catch { /* exists */ }
  }
}
ensureUploadDirs()

function checkMagicBytes(buffer, mimeType) {
  const magic = MAGIC_BYTES[mimeType]
  if (!magic) return true // Can't verify, skip
  for (let i = 0; i < magic.length; i++) {
    if (buffer[i] !== magic[i]) return false
  }
  return true
}

function isDangerousExtension(filename) {
  const ext = path.extname(filename).toLowerCase()
  return DANGEROUS_EXTENSIONS.includes(ext)
}

function createStorage(uploadDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const safeName = `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`
      cb(null, safeName)
    },
  })
}

function createFileFilter(config) {
  return (req, file, cb) => {
    // Check file extension safety
    if (isDangerousExtension(file.originalname)) {
      return cb(new Error(`File type .${path.extname(file.originalname)} is not allowed`), false)
    }

    // Check MIME type
    if (!config.allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} is not allowed. Allowed: ${config.allowedTypes.join(', ')}`), false)
    }

    cb(null, true)
  }
}

export function createUploader(uploadType = 'documents') {
  const config = MIME_CONFIG[uploadType]
  if (!config) {
    logger.error(`Invalid upload type: ${uploadType}`)
    throw new Error(`Invalid upload type: ${uploadType}`)
  }

  const upload = multer({
    storage: createStorage(UPLOAD_DIRS[uploadType]),
    fileFilter: createFileFilter(config),
    limits: {
      fileSize: config.maxSize,
      files: config.maxFiles,
    },
  })

  return {
    single: upload.single('file'),
    multiple: upload.array('files', config.maxFiles),
    fields: upload.fields,
    config,
  }
}

export function verifyFileIntegrity(file) {
  // Wrap in try/catch since we need fs read in sync context
  try {
    const fd = fs.openSync(file.path, 'r')
    const buffer = Buffer.alloc(16)
    fs.readSync(fd, buffer, 0, 16, 0)
    fs.closeSync(fd)
    return checkMagicBytes(buffer, file.mimetype)
  } catch {
    return false
  }
}

export async function deleteUploadedFile(filePath) {
  try {
    await fs.unlink(filePath)
    logger.debug(`Deleted file: ${filePath}`)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Failed to delete file: ${filePath}`, { error: error.message })
    }
  }
}

export async function cleanupOrphanedFiles(maxAgeHours = 24) {
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000
  let cleaned = 0

  for (const dir of Object.values(UPLOAD_DIRS)) {
    try {
      const files = await fs.readdir(dir)
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = await fs.stat(filePath)
        if (stat.mtimeMs < cutoff) {
          await fs.unlink(filePath)
          cleaned++
        }
      }
    } catch { /* skip unavailable dirs */ }
  }

  if (cleaned > 0) logger.info(`Cleaned up ${cleaned} orphaned uploads`)
  return cleaned
}

export function getUploadUrl(uploadType, filename) {
  return `/${UPLOAD_DIRS[uploadType]}/${filename}`
}

export function formatFileInfo(uploadType, file) {
  return {
    id: `file_${Date.now()}`,
    name: file.originalname,
    url: getUploadUrl(uploadType, file.filename),
    type: file.mimetype,
    size: file.size,
    uploadType,
    uploadedAt: new Date().toISOString(),
  }
}

export { UPLOAD_DIRS, MIME_CONFIG }
