import Docker from 'dockerode';
import config from './config.js';

const docker = new Docker();

function followProgress(stream: NodeJS.ReadableStream): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        docker.modem.followProgress(stream, (err, objects) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(objects);
        });
    });
}

function fullyQualifiedImageName(tag: string) {
    return `${config.repository}/${config.image}:${tag}`;
}
const fqin = fullyQualifiedImageName;

export async function pullImage(tag = 'latest') {
    const stream = await docker.pull(fqin(tag), {
        username: config.username,
        password: config.password,
    });
    await followProgress(stream);
}

function run(image: string, options: Docker.ContainerCreateOptions): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        docker.run(image, [], [], options, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        })
    })
}

export async function startContainer(virtualHost: string, tag = 'latest', port: number | null = null) {
    const options: Docker.ContainerCreateOptions = {
        name: `${config.image}-${tag}`,
        Tty: false,
        Env: [
            `VIRTUAL_HOST=${virtualHost}`
        ]
    };
    if (port != null) {
        options.ExposedPorts = {
            [`${port}/tcp`]: {},
        };
    }
    await run(fqin(tag), options);
}

export async function stopContainer(tag = 'latest') {
    const name = `${config.image}-${tag}`;
    const containerInfos = await docker.listContainers({all: true});
    const containerInfo = containerInfos.find(
        info => info.Names[0] === `/${name}`
    );
    if (!containerInfo || containerInfo.State === 'Stopped') {
        return;
    }
    const container = docker.getContainer(containerInfo.Id);
    await container.stop();
}

export async function removeContainer(tag = 'latest') {
    const name = `${config.image}-${tag}`;
    const containerInfos = await docker.listContainers({all: true});
    const containerInfo = containerInfos.find(
        info => info.Names[0] === `/${name}`
    );
    if (!containerInfo) {
        return;
    }
    const container = docker.getContainer(containerInfo.Id);
    await container.remove();
}
