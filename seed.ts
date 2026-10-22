import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

async function main() {
  if (process.env.ALLOW_FIRST_ADMIN !== "true") {
    throw new Error("Per creare il primo amministratore, imposta ALLOW_FIRST_ADMIN=true solo temporaneamente nel tuo ambiente sicuro.");
  }
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim();
  if (!email || !password || !name || password.length < 14) {
    throw new Error("Imposta ADMIN_EMAIL, ADMIN_NAME e ADMIN_PASSWORD (almeno 14 caratteri) nell'ambiente locale sicuro.");
  }
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) throw new Error("Esiste già un utente con questa email; seed interrotto.");
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { email, name, passwordHash, role: Role.DIREZIONE } });
  console.log("Amministratore creato. Disattiva ALLOW_FIRST_ADMIN e rimuovi ADMIN_PASSWORD dall'ambiente.");
}
main().finally(() => db.$disconnect());
