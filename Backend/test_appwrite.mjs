import { Client, Users, Databases } from 'node-appwrite'

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6a584e41001a207399e9')
  .setKey('standard_897fcb55bbf2f621591a72b2d2655cf7b28964142d54bf2e9386c40fcb03fee352172e3b034f01ae433c6fdca3b7a8fa50b4993484e23360d089f8d64e3a952240cfc66890a914cb65692ef0d0710edc44c96ca4a82cdc85154f982e9da69bf2ad48286b6381c652941e980098daef9160d2e9bd7a7c42f990121e8fbb94348c')

const db = new Databases(client)

async function test() {
  const cols = await db.list('6a587e7c')
  console.log('=== Collections in DB ===')
  for (const c of cols.collections) {
    console.log(`  ${c.$id} => name="${c.name}"`)
  }

  const usersCollId = '6a587e7c001fcd24af7c'
  try {
    const docs = await db.listDocuments('6a587e7c', usersCollId, { limit: 5 })
    console.log(`\n=== Users collection docs (${docs.total} total) ===`)
    for (const d of docs.documents) {
      console.log(`  ${d.$id} => ${JSON.stringify(d)}`)
    }
  } catch (e) {
    console.log(`\nFailed to list users collection: ${e.message}`)
  }
}

test().catch(console.error)
