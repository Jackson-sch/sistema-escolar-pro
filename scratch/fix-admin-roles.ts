
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // 1. Revertir usuario actual a administrativo
  const currentUser = await prisma.user.findUnique({
    where: { email: 'admin@colegio.edu.pe' }
  });

  if (currentUser) {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { role: 'administrativo' }
    });
    console.log('✅ Usuario admin@colegio.edu.pe revertido a administrativo.');
  }

  // 2. Obtener estado ACTIVO
  const estadoActivo = await prisma.estadoUsuario.findUnique({
    where: { codigo: 'ACTIVO' }
  });

  if (!estadoActivo) {
    console.error('❌ Estado ACTIVO no encontrado.');
    return;
  }

  // 3. Crear nuevo Super Admin Global
  const superAdminEmail = 'master@sistema.pro';
  const hashedPassword = await bcrypt.hash('Master2026!', 10);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: 'super_admin' },
    create: {
      email: superAdminEmail,
      name: 'Super Admin Sistema',
      password: hashedPassword,
      role: 'super_admin',
      estadoId: estadoActivo.id,
      mustChangePassword: false
    }
  });

  console.log(`🚀 Nuevo Super Admin creado: ${superAdminEmail}`);
  console.log(`🔑 Contraseña: Master2026!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
