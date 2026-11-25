## [3.2.1](https://github.com/dschewchenko/big.esm/compare/v3.2.0...v3.2.1) (2026-11-25)


### Bug Fixes

* handle decimal arithmetic boundaries ([0bf614f](https://github.com/dschewchenko/big.esm/commit/0bf614f08b35b67732d2f85e8948562d4a63bd2b))


### Performance Improvements

* reduce formatting and pipe overhead ([16ce5ff](https://github.com/dschewchenko/big.esm/commit/16ce5ff685b248be219b3000771c6cec64362c0f))

# [3.2.0](https://github.com/dschewchenko/big.esm/compare/v3.1.1...v3.2.0) (2026-11-23)


### Features

* add tree-shakeable pipe operators ([e8e9236](https://github.com/dschewchenko/big.esm/commit/e8e9236f634a0166b00cc745871138449847a06f))
* make decimal mutation explicit ([c09bd8a](https://github.com/dschewchenko/big.esm/commit/c09bd8a3edd0d24a942bac01a01dba62af1f909f))
* simplify decimal inputs and formatting ([86f3238](https://github.com/dschewchenko/big.esm/commit/86f3238c5afcbfc787c524f9c3fb65357e7cbace))


### Performance Improvements

* accelerate short decimal arithmetic ([32c0d8a](https://github.com/dschewchenko/big.esm/commit/32c0d8abce4bb89eb89cc01ef9a37cb8c2abaf4e))
* parse safe integer inputs directly ([a469a34](https://github.com/dschewchenko/big.esm/commit/a469a34c09bc89e3f58d064923d4a37498957872))

## [3.1.1](https://github.com/dschewchenko/big.esm/compare/v3.1.0...v3.1.1) (2026-11-23)


### Bug Fixes

* align TypeScript with ESM entry points ([f2c2ccc](https://github.com/dschewchenko/big.esm/commit/f2c2cccaecb416ac2c07322fec4996fb62166388)), closes [#40](https://github.com/dschewchenko/big.esm/issues/40)

# [3.1.0](https://github.com/dschewchenko/big.esm/compare/v3.0.0...v3.1.0) (2026-11-21)


### Bug Fixes

* restore tree shaking for ESM imports ([9b0a685](https://github.com/dschewchenko/big.esm/commit/9b0a68554e5e0b41fa2b89bda3ce8d4861e7b2a2))


### Features

* add bounded decimal arithmetic and formatting ([0b8a471](https://github.com/dschewchenko/big.esm/commit/0b8a471a08c7077bca380bd2f6f0a0ca2a6da242))

# [3.0.0](https://github.com/dschewchenko/big.esm/compare/v2.0.1...v3.0.0) (2026-11-20)


* feat!: ship only ESM ([0c0309a](https://github.com/dschewchenko/big.esm/commit/0c0309a9c129c353f35284f7b699d03a582fade4))


### BREAKING CHANGES

* CommonJS entry points were removed. Use a static
or dynamic ESM import to load big.esm.

## [2.0.1](https://github.com/dschewchenko/big.esm/compare/v2.0.0...v2.0.1) (2026-11-20)


### Bug Fixes

* correct decimal arithmetic and rounding ([c2c9836](https://github.com/dschewchenko/big.esm/commit/c2c9836a62992eccfe0459de52508c51683845ff))
* support named imports in Node.js ([65518c3](https://github.com/dschewchenko/big.esm/commit/65518c361fad17ba2a67247962965ca2bebfc32b))

# [2.0.0](https://github.com/dschewchenko/big.esm/compare/v1.3.2...v2.0.0) (2025-12-18)


* feat!: big.esm v2 rewrite core ([#31](https://github.com/dschewchenko/big.esm/issues/31)) ([5d05e63](https://github.com/dschewchenko/big.esm/commit/5d05e63b425eaf07722859bd1ff354ec97aaad13))


### BREAKING CHANGES

* operations + alignScale now mutate inputs. Сlone with cloneBig for immutability.

## [1.3.2](https://github.com/dschewchenko/big.esm/compare/v1.3.1...v1.3.2) (2025-10-26)


### Bug Fixes

* migrate to bun and fix dependencies ([302f12b](https://github.com/dschewchenko/big.esm/commit/302f12bcf300a0f14f2af970c34b0251e1bbda81))

## [1.3.1](https://github.com/dschewchenko/big.esm/compare/v1.3.0...v1.3.1) (2023-06-25)


### Bug Fixes

* docs update ([cac1876](https://github.com/dschewchenko/big.esm/commit/cac1876a8455ff044dc9bab66524e4bba2359cf1))

# [1.3.0](https://github.com/dschewchenko/big.esm/compare/v1.2.2...v1.3.0) (2023-06-24)


### Features

* add min max operations ([db274ef](https://github.com/dschewchenko/big.esm/commit/db274ef6c0531b8bd6a2e14839c976d51935db48))

## [1.2.2](https://github.com/dschewchenko/big.esm/compare/v1.2.1...v1.2.2) (2023-05-28)


### Bug Fixes

* import name for types generation ([e41cbf5](https://github.com/dschewchenko/big.esm/commit/e41cbf573d55f46e5baf8ee661483dbcf8dcf289))

## [1.2.1](https://github.com/dschewchenko/big.esm/compare/v1.2.0...v1.2.1) (2023-05-28)


### Bug Fixes

* types path ([03a2b9a](https://github.com/dschewchenko/big.esm/commit/03a2b9a6ccac8bea3b67163568f402fe8d6309bd))


### Performance Improvements

* optimize pow operation and big instance ([0988711](https://github.com/dschewchenko/big.esm/commit/09887110966eaaba3046d085c85a1167e47f6c2c))

# [1.2.0](https://github.com/dschewchenko/big.esm/compare/v1.1.2...v1.2.0) (2023-05-19)


### Features

* add new utility functions: from-string, is-big-value ([3eb674e](https://github.com/dschewchenko/big.esm/commit/3eb674ed53345537db203136ebb5879f8235d37b))
* make mutable option for math operations ([267aaef](https://github.com/dschewchenko/big.esm/commit/267aaef28af70c7c39e015e961c027bf8786569b))


### Performance Improvements

* optimize big instance init for some input types ([9e9ddd2](https://github.com/dschewchenko/big.esm/commit/9e9ddd21adb5590a19395da5fb0b9a5ee66378e4))

## [1.1.2](https://github.com/dschewchenko/big.esm/compare/v1.1.1...v1.1.2) (2023-05-14)


### Bug Fixes

* benchmark update and readme notes ([7b8d446](https://github.com/dschewchenko/big.esm/commit/7b8d446be55eb0f0979ab310491e9bb685215753))

## [1.1.1](https://github.com/dschewchenko/big.esm/compare/v1.1.0...v1.1.1) (2023-05-14)


### Bug Fixes

* readme update and ci update ([d43d486](https://github.com/dschewchenko/big.esm/commit/d43d4869a468d7092674778c97ad888cd4600af8))

# [1.1.0](https://github.com/dschewchenko/big.esm/compare/v1.0.2...v1.1.0) (2023-05-14)


### Features

* to string must return value without zeros by default ([1938f08](https://github.com/dschewchenko/big.esm/commit/1938f0885a478b768f90c797bae53b6320e8b683))

## [1.0.2](https://github.com/dschewchenko/big.esm/compare/v1.0.1...v1.0.2) (2023-05-13)


### Bug Fixes

* update readme and add benchmark ([8e9c2fc](https://github.com/dschewchenko/big.esm/commit/8e9c2fccf23887ca2699d6120dce42733e25945d))

## [1.0.1](https://github.com/dschewchenko/big.esm/compare/v1.0.0...v1.0.1) (2023-05-13)


### Bug Fixes

* rename due to npm 403 ([d54d499](https://github.com/dschewchenko/big.esm/commit/d54d499e1757530a3563fe859c2cffcb8c4fe4de))

# 1.0.0 (2023-05-13)


### Bug Fixes

* readme, description, workflows ([b3f6c22](https://github.com/dschewchenko/big.es/commit/b3f6c22119c37a11d4b805479c4916c4eb480b92))


### Features

* Initial release ([b8433ca](https://github.com/dschewchenko/big.es/commit/b8433ca2f5a1193da7d4ae93041449d803ccf7b1))
