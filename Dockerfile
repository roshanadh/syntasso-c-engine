FROM alpine:3.7

RUN apk add build-base

COPY client-files/submission/* /usr/src/sandbox/

WORKDIR /usr/src/sandbox