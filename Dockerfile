FROM node:latest

RUN apt-get update && apt-get install -y eclipse-temurin:17-jdk-jammy

RUN apt-get update && apt-get install -y python3 python3-pip

ENV PYTHON_VERSION 3.8
ENV PYTHON_PATH /usr/bin/python3.8

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64
ENV JAVA_PATH $JAVA_HOME/bin:$PATH

RUN apt-get update && apt-get install -y gcc g++
ENV PATH="/usr/bin:${PATH}"

WORKDIR /src

COPY package.json package-lock.json ./

EXPOSE 5000

RUN npm install

COPY . .

CMD [ "npm", "run", "dev" ]
