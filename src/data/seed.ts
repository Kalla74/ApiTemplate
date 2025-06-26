import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../core/password';
import Role from '../core/roles';

const prisma = new PrismaClient();

async function main(){

  const passordHash = await hashPassword('Pr0duct9000');

  await prisma.user.createMany({
    data:[
      {
        id: 1,
        name: 'Jhon doe',
        password_hash: passordHash,
        roles: JSON.stringify([Role.ADMIN, Role.USER]),
      },
      {
        id: 2,
        name: 'Jane doe',
        password_hash: passordHash,
        roles: JSON.stringify([ Role.USER]),
      },
    ],
  });
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});