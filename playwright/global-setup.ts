import { loadEnvConfig } from "@next/env";

export default async function globalSetup() {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
}
