const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Seed default profile
  await prisma.profile.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      name: 'Your Name',
      tagline: 'Available for work',
      bio: 'Software developer. I build things for the web and occasionally write about what I learn along the way.',
      about: "Hi! I'm a software developer with a passion for building clean, performant, and thoughtful web experiences.\n\nI work mostly with JavaScript/TypeScript on both the frontend and backend, and I enjoy exploring the intersections of design and engineering.\n\nWhen I'm not coding, I'm reading, hiking, or tinkering with side projects.",
      skills: 'JavaScript, TypeScript, React, Next.js, Node.js, PostgreSQL, Docker, AWS',
      github: 'https://github.com',
      email: 'you@email.com',
    },
  })

  // Seed sample project
  await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      title: 'Open Source CLI Tool',
      description: 'A command-line utility that automates repetitive dev-ops tasks. Built to save 30+ minutes per deployment cycle.',
      tags: ['Go', 'CLI', 'DevOps'],
      githubUrl: 'https://github.com',
      year: '2024',
      order: 0,
    },
  })

  // Seed sample post
  await prisma.post.upsert({
    where: { slug: 'why-i-switched-to-pnpm' },
    update: {},
    create: {
      title: 'Why I Switched from npm to pnpm',
      slug: 'why-i-switched-to-pnpm',
      excerpt: "After years with npm I finally tried pnpm. Here's what I found.",
      content: "I've been using npm for years. It works. But something always nagged me about node_modules ballooning to gigabytes.\n\nThen I tried pnpm.\n\nThe core insight is simple: pnpm uses a content-addressable store. Every version of every package is stored once on your machine and hard-linked into projects. The result? Dramatically smaller footprints and faster installs.\n\nAfter a month of daily use I'm not going back. If you haven't tried it, give it 15 minutes.",
      published: true,
    },
  })

  console.log('✅ Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
