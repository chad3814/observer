import Fastify from 'fastify';
import { pullImage, removeContainer, startContainer, stopContainer } from './docker';
import config from './config';

const server = Fastify({
    logger: true,
});

server.get('/start/:tag', {}, async (req, reply) => {
    const { tag }  = req.params as { tag: string };
    const token = req.raw.headers['x-observer-token'];
    if (!token || token !== config.token) {
        reply.statusCode = 404;
        return reply;
    }
    await pullImage(tag);
    await startContainer(tag, tag);
    return { status: 'OK' };
});

server.get('/stop/:tag', {}, async (req, reply) => {
    const { tag } = req.params as { tag: string };
    const token = req.raw.headers['x-observer-token'];
    if (!token || token !== config.token) {
        reply.statusCode = 404;
        return reply;
    }
    await stopContainer(tag);
    await removeContainer(tag);
    return { status: 'OK' }
});

try {
    await server.listen({ port: config.port ?? 80 });
} catch (err) {
    console.error('failed to start server', err);
    process.exit(1);
}
