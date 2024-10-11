

## [0.7.0](https://github.com/dennemark/prisma-extension-casl/compare/0.6.6...0.7.0) (2024-10-11)


### Features

* :package: update versions and add set polyfills ([056ae52](https://github.com/dennemark/prisma-extension-casl/commit/056ae5272ace68e5e0ec59af092b7f59ca674f93))


### Bug Fixes

* :bug: use correct conditions when restricted fields are used ([6a76f97](https://github.com/dennemark/prisma-extension-casl/commit/6a76f97299c72cf47105875c8dc5acdee7dc1e62))

## [0.6.6](https://github.com/dennemark/prisma-extension-casl/compare/0.6.5...0.6.6) (2024-10-09)


### Bug Fixes

* :bug: return null or empty arry on missing read ability instead of error ([afdc77e](https://github.com/dennemark/prisma-extension-casl/commit/afdc77e2ba8334f0e4554c360ab5b27c4482d350))

## [0.6.5](https://github.com/dennemark/prisma-extension-casl/compare/0.6.4...0.6.5) (2024-10-02)


### Bug Fixes

* :bug: correct optional include query ([195f5a4](https://github.com/dennemark/prisma-extension-casl/commit/195f5a49d5612c01d03bd2a9e5d967752e0d6c02))

## [0.6.4](https://github.com/dennemark/prisma-extension-casl/compare/0.6.3...0.6.4) (2024-09-30)


### Bug Fixes

* :bug: create correct extended instance  of getAbilities ([83f45e0](https://github.com/dennemark/prisma-extension-casl/commit/83f45e0713ced33b874d2e6737e980adfaaa6ab0))

## [0.6.3](https://github.com/dennemark/prisma-extension-casl/compare/0.6.2...0.6.3) (2024-09-26)


### Bug Fixes

* :bug: store permission on null not possible ([3a57167](https://github.com/dennemark/prisma-extension-casl/commit/3a5716789f72cbd2557a88582f5d2234c7e29c9d))

## [0.6.2](https://github.com/dennemark/prisma-extension-casl/compare/0.6.1...0.6.2) (2024-09-25)


### Bug Fixes

* :bug: fluent model masking ([0ad74b6](https://github.com/dennemark/prisma-extension-casl/commit/0ad74b6fa04073115537208299ea4726ca3838e3))

## [0.6.1](https://github.com/dennemark/prisma-extension-casl/compare/0.6.0...0.6.1) (2024-09-24)


### Bug Fixes

* :bug: debug only when debugCasl true ([89970dd](https://github.com/dennemark/prisma-extension-casl/commit/89970dd18cd58bf8f85655b33be8ff7f13c82790))

## [0.6.0](https://github.com/dennemark/prisma-extension-casl/compare/0.5.20...0.6.0) (2024-09-24)


### Features

* :sparkles: add possibility to store simplified crud rights on model ([7130a33](https://github.com/dennemark/prisma-extension-casl/commit/7130a3367c9fe0810cc5406f861eee1e0991098c))

## [0.5.20](https://github.com/dennemark/prisma-extension-casl/compare/0.5.19...0.5.20) (2024-09-23)


### Bug Fixes

* :bug: disconnect equals true for one to one relationship ([43d884d](https://github.com/dennemark/prisma-extension-casl/commit/43d884d359f17aeb5c8d07a4e2245b443634a11f))

## [0.5.19](https://github.com/dennemark/prisma-extension-casl/compare/0.5.18...0.5.19) (2024-09-20)


### Bug Fixes

* :bug: retransform data query on updateMany query ([a327b0e](https://github.com/dennemark/prisma-extension-casl/commit/a327b0e7d8f5b8987fd18281cc5330f5ab29d8b9))

## [0.5.18](https://github.com/dennemark/prisma-extension-casl/compare/0.5.17...0.5.18) (2024-09-19)


### Bug Fixes

* :bug: rule relation selection bing null ([0300772](https://github.com/dennemark/prisma-extension-casl/commit/03007724dc9f7693052ba44376dfe537903913b6))

## [0.5.17](https://github.com/dennemark/prisma-extension-casl/compare/0.5.16...0.5.17) (2024-09-19)


### Bug Fixes

* :bug: allow null query ([119ba28](https://github.com/dennemark/prisma-extension-casl/commit/119ba2821b498187a2b5dff3df2cae33c757aeca))

## [0.5.16](https://github.com/dennemark/prisma-extension-casl/compare/0.5.15...0.5.16) (2024-09-19)


### Bug Fixes

* :bug: filter empty accessibly Query ([ed06804](https://github.com/dennemark/prisma-extension-casl/commit/ed068048cfb016140c1036dd6669c2f60d50fb97))

## [0.5.15](https://github.com/dennemark/prisma-extension-casl/compare/0.5.14...0.5.15) (2024-09-19)


### Bug Fixes

* :bug: allow return of empty array ([0129cd6](https://github.com/dennemark/prisma-extension-casl/commit/0129cd6f21bf4bc34278fcf717550ae4f176ec53))

## [0.5.14](https://github.com/dennemark/prisma-extension-casl/compare/0.5.13...0.5.14) (2024-09-16)


### Bug Fixes

* :bug: carry abilities on interactive transaction ([8bd64e0](https://github.com/dennemark/prisma-extension-casl/commit/8bd64e03f30ba70efb22a46b16bb87fb1655422f))

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
