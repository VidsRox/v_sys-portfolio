import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title.trim(),
      excerpt: body.excerpt?.trim() ?? '',
      content: body.content?.trim() ?? '',
      published: body.published ?? true,
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
