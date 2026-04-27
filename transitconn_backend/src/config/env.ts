import 'dotenv/config'

export function  validateEnv(): void {
    const required = [
        'PORT',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'JWT_SECRET'
    ];

    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
}

export const env = {
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    PORT: parseInt(process.env['PORT'] ?? '5000', 10),
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  db: {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    name: process.env['DB_NAME'] ?? 'transitconn',
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? '',
    poolMax: parseInt(process.env['DB_POOL_MAX'] ?? '20', 10),
  },
  jwt: {
    secret: process.env['JWT_SECRET']!,
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d',
  },
  upload: {
    dir: process.env['UPLOAD_DIR'] ?? 'uploads',
    maxSizeMb: parseInt(process.env['MAX_FILE_SIZE_MB'] ?? '10', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10),
    max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100', 10),
  },
};
