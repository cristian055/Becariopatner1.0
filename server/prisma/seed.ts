import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create default users
  const hashedPassword = await bcrypt.hash('test', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@caddiepro.com' },
    update: {},
    create: {
      email: 'admin@caddiepro.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const operator = await prisma.user.upsert({
    where: { email: 'operator@caddiepro.com' },
    update: {},
    create: {
      email: 'operator@caddiepro.com',
      password: hashedPassword,
      name: 'Operator User',
      role: 'OPERATOR',
      isActive: true,
    },
  })

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@caddiepro.com' },
    update: {},
    create: {
      email: 'viewer@caddiepro.com',
      password: hashedPassword,
      name: 'Viewer User',
      role: 'VIEWER',
      isActive: true,
    },
  })

  console.log('Created users:', { admin, operator, viewer })

  // Create list configurations
  const list1 = await prisma.listConfig.upsert({
    where: { name: 'Primera' },
    update: {},
    create: {
      name: 'Primera',
      category: 'Primera',
      order: 'ASC',
      rangeStart: 1,
      rangeEnd: 40,
    },
  })

  const list2 = await prisma.listConfig.upsert({
    where: { name: 'Segunda' },
    update: {},
    create: {
      name: 'Segunda',
      category: 'Segunda',
      order: 'ASC',
      rangeStart: 41,
      rangeEnd: 80,
    },
  })

  const list3 = await prisma.listConfig.upsert({
    where: { name: 'Tercera' },
    update: {},
    create: {
      name: 'Tercera',
      category: 'Tercera',
      order: 'ASC',
      rangeStart: 81,
      rangeEnd: 100,
    },
  })

  console.log('Created list configs:', { list1, list2, list3 })

  // Create 100 caddies
  console.log('Creating 100 caddies...')
  for (let i = 1; i <= 100; i++) {
    let category: 'Primera' | 'Segunda' | 'Tercera' = 'Primera'
    if (i > 40 && i <= 80) category = 'Segunda'
    if (i > 80) category = 'Tercera'

    const caddie = await prisma.caddie.upsert({
      where: { number: i },
      update: {},
      create: {
        name: `Caddie ${i}`,
        number: i,
        status: 'AVAILABLE',
        isActive: true,
        historyCount: 0,
        absencesCount: 0,
        lateCount: 0,
        leaveCount: 0,
        lastActionTime: '08:00 AM',
        category,
        location: 'Llanogrande',
        role: i % 5 === 0 ? 'Hybrid' : 'Golf',
        weekendPriority: i,
      },
    })

    // Create availability for each caddie
    await prisma.dayAvailability.createMany({
      data: [
        {
          caddieId: caddie.id,
          day: 'Friday',
          isAvailable: true,
          rangeType: 'after',
          rangeTime: '09:30 AM',
        },
        {
          caddieId: caddie.id,
          day: 'Saturday',
          isAvailable: true,
          rangeType: 'full',
        },
        {
          caddieId: caddie.id,
          day: 'Sunday',
          isAvailable: true,
          rangeType: 'full',
        },
      ],
      skipDuplicates: true,
    })

    if (i % 10 === 0) {
      console.log(`Created ${i} caddies...`)
    }
  }

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
