
import prisma from '../src/lib/prisma';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@colegio.edu.pe' }
  });

  if (!user) {
    console.error('Usuario admin@colegio.edu.pe no encontrado');
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'super_admin' }
  });

  console.log('Usuario admin@colegio.edu.pe promovido a super_admin');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
