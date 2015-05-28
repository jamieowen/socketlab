# Socketlab
FROM node:0.12.4

COPY . /socketlab
RUN cd /socketlab; npm install

EXPOSE 6553

CMD [ "node", "/socketlab/src/server/index.js"]
