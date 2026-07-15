import pb from '@/lib/pocketbase/client'

export interface UserRecord {
  id: string
  name: string
  email: string
  role: string
}

export async function getUsers(): Promise<UserRecord[]> {
  const records = await pb.collection('users').getFullList({ sort: 'created' })
  return records.map((r: any) => ({
    id: r.id,
    name: r.name || '',
    email: r.email,
    role: r.role || 'Visualizador',
  }))
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: string,
): Promise<UserRecord> {
  const record = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name,
    role,
  })
  return {
    id: record.id,
    name: record.name || '',
    email: record.email,
    role: record.role || 'Visualizador',
  }
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  await pb.collection('users').update(id, { role })
}

export async function deleteUser(id: string): Promise<void> {
  await pb.collection('users').delete(id)
}
