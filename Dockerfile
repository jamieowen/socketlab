# Socketlab
FROM node:0.12.4

COPY . /socketlab
WORKDIR /socketlab

RUN npm install
RUN npm install -g pm2

EXPOSE 8080

#CMD [ "pm2", "start", "socketlab/src/server/index.js", "--no-daemon", "--name", "socketlab" ]

CMD [ "npm", "run", "start" ]
