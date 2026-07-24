import { ID } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'

const DB_ID = appConfig.appwrite.databaseId
const SKILLS_COLLECTION = 'skills'

function getSkillsCollectionId() {
  return process.env.APPWRITE_SKILLS_COLLECTION_ID || SKILLS_COLLECTION
}

const PRESET_CATEGORIES = [
  'frontend', 'backend', 'mobile', 'devops', 'design',
  'data', 'ai', 'blockchain', 'security', 'general',
]

const PRESET_SKILLS = [
  { name: 'JavaScript', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'React', category: 'frontend' },
  { name: 'Vue.js', category: 'frontend' },
  { name: 'Angular', category: 'frontend' },
  { name: 'HTML/CSS', category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'Express', category: 'backend' },
  { name: 'Python', category: 'backend' },
  { name: 'Django', category: 'backend' },
  { name: 'FastAPI', category: 'backend' },
  { name: 'Go', category: 'backend' },
  { name: 'Rust', category: 'backend' },
  { name: 'PostgreSQL', category: 'backend' },
  { name: 'MongoDB', category: 'backend' },
  { name: 'Redis', category: 'backend' },
  { name: 'GraphQL', category: 'backend' },
  { name: 'Docker', category: 'devops' },
  { name: 'Kubernetes', category: 'devops' },
  { name: 'AWS', category: 'devops' },
  { name: 'Azure', category: 'devops' },
  { name: 'CI/CD', category: 'devops' },
  { name: 'Terraform', category: 'devops' },
  { name: 'Linux', category: 'devops' },
  { name: 'React Native', category: 'mobile' },
  { name: 'Flutter', category: 'mobile' },
  { name: 'Swift', category: 'mobile' },
  { name: 'Kotlin', category: 'mobile' },
  { name: 'Figma', category: 'design' },
  { name: 'UI/UX', category: 'design' },
  { name: 'Adobe XD', category: 'design' },
  { name: 'Sketch', category: 'design' },
  { name: 'Python', category: 'data' },
  { name: 'SQL', category: 'data' },
  { name: 'Tableau', category: 'data' },
  { name: 'Power BI', category: 'data' },
  { name: 'TensorFlow', category: 'ai' },
  { name: 'PyTorch', category: 'ai' },
  { name: 'Machine Learning', category: 'ai' },
  { name: 'Natural Language Processing', category: 'ai' },
  { name: 'Solidity', category: 'blockchain' },
  { name: 'Web3', category: 'blockchain' },
  { name: 'Smart Contracts', category: 'blockchain' },
  { name: 'OAuth', category: 'security' },
  { name: 'Penetration Testing', category: 'security' },
  { name: 'Compliance', category: 'security' },
]

export async function getSkills(options = {}) {
  const { category, search, limit = 50 } = options
  const databases = getDatabases()
  const collectionId = getSkillsCollectionId()

  const queries = ['limit=' + limit]

  if (category) {
    queries.push(`category=${category}`)
  }

  if (search) {
    queries.push(`name~${search}`)
  }

  try {
    const documents = await databases.listDocuments(DB_ID, collectionId, queries)
    return documents.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      category: doc.category,
      slug: doc.slug,
      description: doc.description || '',
      popularityScore: doc.popularityScore || 0,
    }))
  } catch (error) {
    if (error?.code === 404) {
      return PRESET_SKILLS
        .filter(s => !category || s.category === category)
        .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, limit)
        .map((s, i) => ({ id: `preset_${i}`, name: s.name, category: s.category, slug: s.name.toLowerCase().replace(/\s+/g, '-') }))
    }
    throw error
  }
}

export async function getCategories() {
  return PRESET_CATEGORIES.map(c => ({
    id: c,
    name: c.charAt(0).toUpperCase() + c.slice(1),
    slug: c,
  }))
}

export async function createSkill(data) {
  const databases = getDatabases()
  const collectionId = getSkillsCollectionId()

  const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const skillData = {
    name: data.name.trim(),
    category: data.category || 'general',
    slug,
    description: data.description || '',
    popularityScore: data.popularityScore || 0,
    isActive: true,
    status: 'active',
  }

  const doc = await databases.createDocument(DB_ID, collectionId, ID.unique(), skillData)
  return { id: doc.$id, ...doc }
}

export async function getPresetSkills() {
  return PRESET_SKILLS.map((s, i) => ({
    id: `preset_${i}`,
    name: s.name,
    category: s.category,
    slug: s.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}
