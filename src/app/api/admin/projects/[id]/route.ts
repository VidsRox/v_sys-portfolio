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

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title: body.title.trim(),
      description: body.description?.trim() ?? '',
      tags: Array.isArray(body.tags) ? body.tags : [],
      liveUrl: body.liveUrl?.trim() ?? '',
      githubUrl: body.githubUrl?.trim() ?? '',
      year: body.year?.trim() ?? '',
    },
  })

  return NextResponse.json(project)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
