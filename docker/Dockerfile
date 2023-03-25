FROM node:16-alpine

RUN apk add --no-cache g++ make python2

WORKDIR /app

COPY ./package.json *yarn* ./
RUN yarn install

COPY . /app

USER node

CMD ["sh", "-c", "yarn build"]
