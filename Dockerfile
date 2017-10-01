FROM node:8
COPY ["package.json", "package-lock.json", "./"]
RUN npm install -g typescript
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /home/app/ && cp -a /tmp/node_modules /home/app/
WORKDIR /home/app/
COPY ["package.json", "tsconfig.json", "package-lock.json", "./"]
COPY ./source source/
COPY ./public public/
RUN tsc
EXPOSE 3000
CMD ["npm", "start"]