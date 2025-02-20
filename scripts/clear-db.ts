// scripts/clear-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function clearDatabase() {
  console.log('🔄 Starting database cleanup...');
  
  try {
    console.log('Deleting Meetings...');
    await prisma.meeting.deleteMany({});
    
    console.log('Deleting Tasks...');
    await prisma.task.deleteMany({});
    
    console.log('Deleting CalendarAccounts...');
    await prisma.calendarAccount.deleteMany({});
    
    console.log('Deleting Sessions...');
    await prisma.session.deleteMany({});
    
    console.log('Deleting Accounts...');
    await prisma.account.deleteMany({});
    
    console.log('Deleting VerificationTokens...');
    await prisma.verificationToken.deleteMany({});
    
    console.log('Deleting Users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ Database successfully cleared!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Add debugging statement to track query execution
process.on('beforeExit', () => {
  console.log('Script completed');
});

// Run the function
clearDatabase();