FROM node:16.13.0

RUN apt update
RUN apt install git python build-essential -y
RUN npm install -g npm@9.6.6

WORKDIR /app
COPY . /app

CMD [ "sh", "-c", "yarn install; yarn build" ]