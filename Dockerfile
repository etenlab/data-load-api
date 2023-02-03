FROM node:16

# Create app directory
WORKDIR /usr/src/etenlab/data-load-api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./

RUN npm ci
RUN npm run build

CMD [ "npm", "run", "start:prod" ]