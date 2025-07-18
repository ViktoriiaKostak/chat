import { config } from 'dotenv';
import { join } from 'path';

export function loadEnvConfig(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const envFiles = [
    `.env.${nodeEnv}.local`,
    `.env.${nodeEnv}`,
    '.env.local',
    '.env',
  ];

  for (const envFile of envFiles) {
    const envPath = join(process.cwd(), envFile);
    const result = config({ path: envPath });

    if (result.parsed) {
      console.log(`📄 Loaded environment from: ${envFile}`);
      break;
    }
  }

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
}
