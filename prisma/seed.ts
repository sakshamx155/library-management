import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { mockUsers, mockResources, mockLeaderboard } from "../src/lib/mock-data";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log("Seeding started...");

  // Seed Users
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  }
  console.log("Users seeded.");

  // Seed Leaderboard
  for (const lb of mockLeaderboard) {
    await prisma.leaderboardContributor.upsert({
      where: { id: lb.id },
      update: {},
      create: {
        id: lb.id,
        name: lb.name,
        points: lb.points,
        avatarFallback: lb.avatarFallback,
        badges: lb.badges,
      },
    });
  }
  console.log("Leaderboard seeded.");

  // Seed Resources & Tags
  for (const res of mockResources) {
    const data = {
      id: res.id,
      title: res.title,
      author: res.author,
      subject: res.subject,
      resource_type: res.resource_type,
      file_url: res.file_url,
      thumbnail: res.thumbnail,
      downloads: res.downloads,
      rating: res.rating,
      reviewsCount: res.reviewsCount,
      description: res.description,
      difficulty: res.difficulty,
      progress: res.progress,
      tags: {
        connectOrCreate: (res.tags || []).map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      }
    };
    
    // Check if it exists to avoid errors on duplicate IDs if re-running
    const existing = await prisma.resource.findUnique({ where: { id: res.id } });
    if (!existing) {
        await prisma.resource.create({ data });
    }
  }
  console.log("Resources seeded.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
