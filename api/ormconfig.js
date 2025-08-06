import { dataSourceOptions } from '~/core/database/data-source';

module.exports = {
  ...dataSourceOptions,
  seeds: ['src/**/*{seed.ts,seed.js}'],
  factories: ['src/**/*{factory.ts,factory.js}'],
};
