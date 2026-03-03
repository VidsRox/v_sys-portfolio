import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const count = await prisma.project.count()
  const project = await prisma.project.create({
    data: {
      title: body.title.trim(),
      description: body.description?.trim() ?? '',
      tags: Array.isArray(body.tags) ? body.tags : [],
      liveUrl: body.liveUrl?.trim() ?? '',
      githubUrl: body.githubUrl?.trim() ?? '',
      year: body.year?.trim() ?? '',
      order: count,
    },
  })

  return NextResponse.json(project)
}
