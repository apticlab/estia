FROM node:22

RUN apt update
RUN apt install git build-essential -y
RUN npm install -g npm@9.6.6

WORKDIR /app
COPY . /app

CMD [ "sh", "-c", "yarn install; yarn build" ]