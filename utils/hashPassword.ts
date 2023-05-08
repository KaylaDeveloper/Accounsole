import bcrypt from "bcryptjs";
export default async function hashPassword(password: string) {
  const salt = await bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
