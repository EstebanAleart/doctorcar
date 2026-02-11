import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Variables de entorno
const OLD_DB = process.env.OLD_DIRECT_URL;
const NEW_DB = process.env.DIRECT_URL;

if (!OLD_DB || !NEW_DB) {
  console.error("❌ Faltan variables OLD_DIRECT_URL o DIRECT_URL en el .env");
  process.exit(1);
}

// 🔹 Archivo temporal de backup
const BACKUP_FILE = "backup_public.dump";

try {
  console.log("📦 Exportando DB vieja (solo schema public)...");
  
  // ⚡ Exportamos solo el schema public
  execSync(
    `pg_dump "${OLD_DB}" --schema=public --format=custom --no-owner --no-acl --file=${BACKUP_FILE}`,
    { stdio: "inherit" }
  );

  console.log("🚀 Importando en DB nueva...");
  
  // ⚡ Restauramos
  execSync(
    `pg_restore --verbose --clean --if-exists --no-owner --no-acl --dbname="${NEW_DB}" ${BACKUP_FILE}`,
    { stdio: "inherit" }
  );

  console.log("✅ Migración completa papá. DB clonada con éxito.");
} catch (err) {
  console.error("🔥 Error en migración:", err.message);
  process.exit(1);
}
