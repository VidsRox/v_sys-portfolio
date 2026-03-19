import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadImage(buffer, filename)

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}