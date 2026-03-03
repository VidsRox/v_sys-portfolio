import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: 'main' } })
  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const profile = await prisma.profile.upsert({
    where: { id: 'main' },
    update: {
      name: body.name,
      tagline: body.tagline,
      bio: body.bio,
      about: body.about,
      skills: body.skills,
      github: body.github,
      twitter: body.twitter,
      linkedin: body.linkedin,
      email: body.email,
    },
    create: {
      id: 'main',
      name: body.name,
      tagline: body.tagline,
      bio: body.bio,
      about: body.about,
      skills: body.skills,
      github: body.github,
      twitter: body.twitter,
      linkedin: body.linkedin,
      email: body.email,
    },
  })

  return NextResponse.json(profile)
}
