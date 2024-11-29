const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createInitialAdminUser() {
    try {
        // Check if an admin user already exists
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Generate a secure password
        const hashedPassword = await bcrypt.hash('admin@123', 10);

        // Create the admin user
        const adminUser = await prisma.user.create({
            data: {
                name: 'System Admin',
                email: 'admin@quizpro.com',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log('Initial admin user created:', adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createInitialAdminUser();
