import fs from 'node:fs/promises';

export type ObserverConfig = {
    repository: string;
    image: string;
    username: string;
    password: string;
    token: string;
    port?: number;
}

if (!process.env['IMAGE']) {
    throw new Error('IMAGE environment variable required');
}

const config: ObserverConfig = {
    repository: process.env['REPOSITORY'] ?? 'ghcr.io',
    image: process.env['IMAGE'],
    username: await fs.readFile(process.env['USERNAME_FILE'] ?? '/run/secrets/username', 'utf-8'),
    password: await fs.readFile(process.env['PASSWORD_FILE'] ?? '/run/secrets/password', 'utf-8'),
    token: await fs.readFile(process.env['TOKEN_FILE'] ?? '/run/secrets/token', 'utf-8'),
    port: process.env['PORT'] ? (
        !isNaN(Number(process.env['PORT'])) ? Number(process.env['PORT']) : undefined
    ) : undefined,
};


export default config;