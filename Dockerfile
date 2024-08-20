FROM node:lts-alpine AS build

COPY . /app/
WORKDIR /app

RUN npm ci && npm run build


FROM node:lts-alpine

COPY --from=build /app/package.json /app/package-lock.json /app/
COPY --from=build /app/dist /app/
WORKDIR /app

RUN npm i --omit dev

EXPOSE 80
VOLUME [ "/var/run/docker.sock" ]
ENV VIRTUAL_HOST=observer

CMD [ "node", "/app/" ]
