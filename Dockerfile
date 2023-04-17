FROM node:latest

RUN apt-get update && apt-get install -y openjdk-11-jdk

RUN apt-get update && apt-get install -y python3 python3-pip

ENV PYTHON_VERSION 3.8
ENV PYTHON_PATH /usr/bin/python3.8

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64
ENV PATH $JAVA_HOME/bin:$PATH

WORKDIR /src

COPY package.json package-lock.json ./

EXPOSE 3000

RUN npm install

COPY . .

CMD [ "npm", "run", "dev" ]
