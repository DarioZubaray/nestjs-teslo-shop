<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Dependency installation

```bash
$ npm install
ó
$ yarn install
```

## Setting envvironment variables

```bash
$ mv .env.template .env
```

## Postgres container in Docker

```bash
$ docker-compose up -d
```

## Populate database

```bash
$ curl http://localhost:3000/api/seed
```

## Running the app

```bash
$ npm run start:dev
ó
$ yarn start:dev
```

## Api documentation

```bash
http://localhost:3000/api
```