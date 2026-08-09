import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import "dotenv/config";

async function runBackup() {
  console.log("📦 [Backup Engine] Iniciando respaldo de la base de datos...");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ [Error] DATABASE_URL no está definida en el entorno.");
    process.exit(1);
  }

  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, "_").replace(/:/g, "-").split(".")[0];
  const filename = `backup_sistema_escolar_${timestamp}.sql`;
  const outputPath = path.join(backupDir, filename);

  try {
    // Parse de la URL de conexión de PostgreSQL
    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || "5432";
    const user = url.username;
    const password = url.password;
    const dbName = url.pathname.replace(/^\//, "");

    console.log(`📡 Conectando a PostgreSQL database: '${dbName}' en ${host}:${port}...`);

    // Ejecución de pg_dump con variables de entorno temporales
    const env = { ...process.env, PGPASSWORD: password };
    const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${dbName} -F p -f "${outputPath}"`;

    execSync(command, { env, stdio: "inherit" });

    const stats = fs.statSync(outputPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ [Éxito] Respaldo completado exitosamente:`);
    console.log(`   📄 Archivo: ${outputPath}`);
    console.log(`   📊 Tamaño: ${sizeMb} MB`);

    // Limpieza de respaldos antiguos (>30 días)
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const files = fs.readdirSync(backupDir);
    let deletedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(backupDir, file);
      const fileStats = fs.statSync(filePath);
      if (now.getTime() - fileStats.mtimeMs > thirtyDaysMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`🧹 [Limpieza] Se eliminaron ${deletedCount} respaldos antiguos (>30 días).`);
    }
  } catch (error: any) {
    console.error("❌ [Error] Falló la creación del respaldo:", error.message || error);
    console.log("💡 Nota: Asegúrate de tener 'pg_dump' instalado y disponible en el PATH del sistema.");
  }
}

runBackup();
