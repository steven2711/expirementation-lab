import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('testpassword123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });
  console.log('✅ Created test user:', user.email);

  // Create project
  const project = await prisma.project.upsert({
    where: { id: user.id }, // Using a deterministic ID based on user
    update: {},
    create: {
      name: 'Test Project',
      description: 'A test project for development and testing',
      userId: user.id,
      apiKey: 'test_api_key_' + Math.random().toString(36).substring(7),
    },
  });
  console.log('✅ Created project:', project.name);

  // Create experiments
  const experiments = [
    {
      name: 'Homepage Hero Button Test',
      description: 'Testing different CTA button colors on the homepage hero section',
      status: 'running',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
    },
    {
      name: 'Checkout Flow Optimization',
      description: 'A/B testing single-page vs multi-step checkout process',
      status: 'stopped',
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      stoppedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Pricing Page Layout',
      description: 'Testing grid vs table layout for pricing comparison',
      status: 'draft',
    },
  ];

  for (const expData of experiments) {
    const experiment = await prisma.experiment.create({
      data: {
        ...expData,
        projectId: project.id,
        trafficAllocation: { control: 50, variant: 50 },
      },
    });
    console.log(`✅ Created experiment: ${experiment.name}`);

    // Add sample events for running and stopped experiments
    if (experiment.status === 'running' || experiment.status === 'stopped') {
      const numUsers = 100 + Math.floor(Math.random() * 400); // 100-500 users
      const conversionRateControl = 0.08 + Math.random() * 0.07; // 8-15%
      const conversionRateVariant = conversionRateControl * (0.9 + Math.random() * 0.3); // -10% to +20%

      for (let i = 0; i < numUsers; i++) {
        const userId = `user_${i}_${experiment.id.substring(0, 8)}`;
        const variant = Math.random() < 0.5 ? 'control' : 'variant';
        
        // Create assignment event
        await prisma.event.create({
          data: {
            experimentId: experiment.id,
            userId,
            sessionId: `session_${i}`,
            eventType: 'assignment',
            variant,
            timestamp: new Date(
              experiment.startedAt!.getTime() + 
              Math.random() * (Date.now() - experiment.startedAt!.getTime())
            ),
          },
        });

        // Create conversion event based on conversion rate
        const shouldConvert = variant === 'control' 
          ? Math.random() < conversionRateControl
          : Math.random() < conversionRateVariant;

        if (shouldConvert) {
          await prisma.event.create({
            data: {
              experimentId: experiment.id,
              userId,
              sessionId: `session_${i}`,
              eventType: 'conversion',
              variant,
              metadata: {
                revenue: 10 + Math.random() * 190, // $10-200
                source: ['organic', 'paid', 'social', 'direct'][Math.floor(Math.random() * 4)],
              },
              timestamp: new Date(
                experiment.startedAt!.getTime() + 
                Math.random() * (Date.now() - experiment.startedAt!.getTime())
              ),
            },
          });
        }
      }
      console.log(`  📊 Added ${numUsers} users with events for ${experiment.name}`);
    }
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: testpassword123');
  console.log('');
  console.log(`🔑 API Key: ${project.apiKey}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });