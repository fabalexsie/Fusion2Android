FROM node:18.14.2

# INSTALL PYTHON DEPENDENCIES
RUN apt-get update && apt-get install python3 python3-pip -y
#RUN pip3 install -r python/requirements.txt
RUN pip3 install usd2gltf
RUN pip3 install pygltflib

# INSTALL NPM DEPENDENCIES
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json frontend/tsconfig.json ./
RUN npm install

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm install ts-node

# BUILD FRONTEND
WORKDIR /app/frontend
COPY frontend/public ./public
COPY frontend/src ./src
RUN npm run build


# COPY SRC FILES SERVER
WORKDIR /app
COPY src ./src
COPY scripts ./scripts

# COPY PYTHON FILES
COPY python ./python

ENTRYPOINT ["npm", "run" ,"production"]