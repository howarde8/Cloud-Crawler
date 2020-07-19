FROM node:alpine
WORKDIR /usr
COPY ./package*.json ./
RUN npm install
ENV PATH /usr/node_modules/.bin:$PATH

WORKDIR /usr/app
COPY ./ ./
CMD ["npm", "run", "dev"]