

## [0.5.13](https://github.com/dennemark/prisma-extension-casl/compare/0.5.12...0.5.13) (2024-09-11)


### Bug Fixes

* :bug: remove where query on creation if it was added by includeSelect ([9ca163d](https://github.com/dennemark/prisma-extension-casl/commit/9ca163dc646dcb2eb204b086db6afc3554e7e8b9))

## [0.5.12](https://github.com/dennemark/prisma-extension-casl/compare/0.5.11...0.5.12) (2024-09-05)


### Bug Fixes

* :bug: get nested values to check rules ([9096f6a](https://github.com/dennemark/prisma-extension-casl/commit/9096f6aae45b503e2708b3196ffcb221c8020400))

## [0.5.11](https://github.com/dennemark/prisma-extension-casl/compare/0.5.10...0.5.11) (2024-09-04)


### Bug Fixes

* :bug: proper check if include is undefined ([221a78d](https://github.com/dennemark/prisma-extension-casl/commit/221a78d3875825572eb463bb4d77a7dacab9e7eb))

## [0.5.10](https://github.com/dennemark/prisma-extension-casl/compare/0.5.9...0.5.10) (2024-09-04)


### Bug Fixes

* :bug: return null if filteredQueryResult has no keys ([099e3c2](https://github.com/dennemark/prisma-extension-casl/commit/099e3c28687d72f95eb934897ab192a1d2e23d12))

## [0.5.9](https://github.com/dennemark/prisma-extension-casl/compare/0.5.8...0.5.9) (2024-08-16)


### Bug Fixes

* :bug: properly include create relations ([97136c1](https://github.com/dennemark/prisma-extension-casl/commit/97136c1f0226750f2a58bee1b72596051ba2033c))

## [0.5.8](https://github.com/dennemark/prisma-extension-casl/compare/0.5.7...0.5.8) (2024-08-16)


### Bug Fixes

* :bug: improve error message on create ([bffbd83](https://github.com/dennemark/prisma-extension-casl/commit/bffbd836f4bb6a3e0d8aa7408beae51e3f7ab336))

## [0.5.7](https://github.com/dennemark/prisma-extension-casl/compare/0.5.6...0.5.7) (2024-08-16)


### Bug Fixes

* :bug: fix create queries ([e2f678c](https://github.com/dennemark/prisma-extension-casl/commit/e2f678cbaeff2c3e663f44d081d75ef604dfb864))

## [0.5.6](https://github.com/dennemark/prisma-extension-casl/compare/0.5.5...0.5.6) (2024-08-14)


### Bug Fixes

* :bug: only allow creation if object fits condition ([7a6bd77](https://github.com/dennemark/prisma-extension-casl/commit/7a6bd7747e053420045a99943972715bb5d11514))

## [0.5.5](https://github.com/dennemark/prisma-extension-casl/compare/0.5.4...0.5.5) (2024-08-09)


### Bug Fixes

* :bug: fix version of prisma ([8c00e9d](https://github.com/dennemark/prisma-extension-casl/commit/8c00e9df0826832c5659944e3b93814d1d30479b))

## [0.5.4](https://github.com/dennemark/prisma-extension-casl/compare/0.5.3...0.5.4) (2024-08-09)


### Bug Fixes

* :bug: use prisma version 5.14.0 ([16f783f](https://github.com/dennemark/prisma-extension-casl/commit/16f783f35259014d210c7f45a54b130384e570c3))

## [0.5.3](https://github.com/dennemark/prisma-extension-casl/compare/0.5.2...0.5.3) (2024-08-09)


### Bug Fixes

* :bug: correct get abilities function ([a3469fd](https://github.com/dennemark/prisma-extension-casl/commit/a3469fd9f42d636c1ddf57d1ac6c1fe57b925f2e))
* :label: reproduce type of client for $casl output ([98f66ba](https://github.com/dennemark/prisma-extension-casl/commit/98f66ba42e1ee7157d1cf33bd62a0356debae661))

## [0.5.2](https://github.com/dennemark/prisma-extension-casl/compare/0.5.1...0.5.2) (2024-08-08)


### Bug Fixes

* :label: try fix type of casl client ([d39c4cc](https://github.com/dennemark/prisma-extension-casl/commit/d39c4cc3e02546975085c08615cb5759fd6c12fa))

## [0.5.1](https://github.com/dennemark/prisma-extension-casl/compare/0.5.0...0.5.1) (2024-08-08)


### Bug Fixes

* :bug: alternative way to alter abilities on prisma client ([a9e22d9](https://github.com/dennemark/prisma-extension-casl/commit/a9e22d91905d05de46809c7f2ecf67e6c54a1564))

## [0.5.0](https://github.com/dennemark/prisma-extension-casl/compare/0.4.3...0.5.0) (2024-08-08)


### Features

* :sparkles: add ability to alter abilities before using query ([aeb03fc](https://github.com/dennemark/prisma-extension-casl/commit/aeb03fce399c47c27c8505a55ccbc2e6346a8263))

## [0.4.3](https://github.com/dennemark/prisma-extension-casl/compare/0.4.2...0.4.3) (2024-08-08)


### Bug Fixes

* :bug: consider nested or and and conditions in rule relations ([7f5187f](https://github.com/dennemark/prisma-extension-casl/commit/7f5187fa48a953960cb8cea5ac5018f5c11af715))

## [0.4.2](https://github.com/dennemark/prisma-extension-casl/compare/0.4.1...0.4.2) (2024-08-08)


### Bug Fixes

* :bug: apply rule relations even if no include or select exist ([055f7ed](https://github.com/dennemark/prisma-extension-casl/commit/055f7ed738f9dafa77dddef6b51bd1758ee9b0f8))

## [0.4.1](https://github.com/dennemark/prisma-extension-casl/compare/0.4.0...0.4.1) (2024-08-07)


### Bug Fixes

* :bug: query relations even for inverted and conditional rules ([50f62c8](https://github.com/dennemark/prisma-extension-casl/commit/50f62c83b08e693993f665dfee6d66bb9b443094))

## [0.4.0](https://github.com/dennemark/prisma-extension-casl/compare/0.3.0...0.4.0) (2024-07-31)


### Features

* :technologist: add debugCasl flag to query ([12aa007](https://github.com/dennemark/prisma-extension-casl/commit/12aa007cdbb599562ca458ec6f45272d99a2ac9b))

## [0.3.0](https://github.com/dennemark/prisma-extension-casl/compare/0.2.0...0.3.0) (2024-07-31)


### Features

* :sparkles: filter permissions on query result ([54b0d8b](https://github.com/dennemark/prisma-extension-casl/commit/54b0d8b07f715b7f6cd0a85bfaae2d775cc33566))

## [0.2.0](https://github.com/dennemark/prisma-extension-casl/compare/0.1.4...0.2.0) (2024-07-30)


### Features

* :sparkles: filter results in app and not within db query ([3af823f](https://github.com/dennemark/prisma-extension-casl/commit/3af823f334a24c770b54f336bbfe5231062d31c5))

## [0.1.4](https://github.com/dennemark/prisma-extension-casl/compare/0.1.3...0.1.4) (2024-07-26)


### Bug Fixes

* :bug: consider rules without fields in select queries ([2a222ae](https://github.com/dennemark/prisma-extension-casl/commit/2a222aec8b546f416bbed9ea19f79acd77a7b877))

## [0.1.3](https://github.com/dennemark/prisma-extension-casl/compare/0.1.2...0.1.3) (2024-07-26)


### Bug Fixes

* :art: expose apply casl to query function ([06e9fdb](https://github.com/dennemark/prisma-extension-casl/commit/06e9fdb6193173d0d0189a3ee80b25fb1300a322))
* :label: fix type in test ([4f6be55](https://github.com/dennemark/prisma-extension-casl/commit/4f6be55196d546b15783623b537f9f2ddcdb3be0))

## [0.1.2](https://github.com/dennemark/prisma-extension-casl/compare/0.1.1...0.1.2) (2024-07-26)


### Bug Fixes

* :bug: move getAbilities function to prisma queries ([3d36182](https://github.com/dennemark/prisma-extension-casl/commit/3d36182340e5e4fdca89a6b530383a595bafdb90))

## <small>0.1.1 (2024-07-26)</small>

* fix: :bug: make abilities a function to allow getting context in nodejs app ([05b3afd](https://github.com/dennemark/prisma-extension-casl/commit/05b3afd))



## 0.1.0 (2024-07-26)

* Initial commit ([db726be](https://github.com/dennemark/prisma-extension-casl/commit/db726be))
* feat: :sparkles: prisma extension casl ([8ece2c2](https://github.com/dennemark/prisma-extension-casl/commit/8ece2c2))
