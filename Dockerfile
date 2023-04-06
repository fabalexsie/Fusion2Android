FROM node:18.14.2

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json frontend/tsconfig.json ./
COPY frontend/public ./public
COPY frontend/src ./src
#COPY frontend/ ./
RUN npm install

WORKDIR /app
COPY package.json package-lock.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm install
RUN npm install ts-node

WORKDIR /app/frontend
RUN npm run build
WORKDIR /app

COPY python ./python
RUN apt-get update && apt-get install python3 python3-pip -y
#RUN pip3 install -r python/requirements.txt
RUN pip3 install usd2gltf
RUN pip3 install pygltflib

ENTRYPOINT ["npm", "run" ,"production"]