const { prisma, bcrypt } = require('./common'); 

async function main() {
    console.log('Seeding started...');

    await prisma.user.deleteMany();
    

    //--- creating users---
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
        data: {
            firstname: 'Kev',
            lastname: "jones",
            password: hashedPassword,
            email: "test@test.com"
        }
    });
    console.log(`Created user: ${user1.email} (ID: ${user1.id})`);

    const user2 = await prisma.user.create({
        data: {
            firstname: 'Kate',
            lastname: "jones",
            password: hashedPassword,
            email: "test2@test.com"
        }
    });

    console.log(`Created user: ${user2.email} (ID: ${user2.id})`);

    console.log('Seeding finished.');
}

main()
    