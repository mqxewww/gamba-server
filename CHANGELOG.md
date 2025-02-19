# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Implemented nestjs logger.

### Changed

- Replaced NodeJS with Bun.
- Replaced Express with Fastify.
- Several dependencies changed/deleted.
- Moved some service methods to gateway, now callable with NestJS EventEmitter.

### Fixed

- Fix "ReferenceError: Cannot access 'Entity' before initialization" by using Rel mapped type (see https://mikro-orm.io/docs/relationships).

### Removed

- Removed .npmrc file

## [0.1.0] - 2025-02-15

### Added

- First operational version.
- Setup NestJS project with MikroORM.
- Created module "CrashGames" with its API routes and Websockets routes.

### Important Notes

- App is under development and is not yet ready to be used.
- No authentication has yet been set up, but will be at a later date.
- Using Bun instead of NodeJS is mandatory, as Bun's speed will enable me to be precise to the millisecond.
