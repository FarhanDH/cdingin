import { configDotenv } from 'dotenv';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { configuration } from '~/common/configuration';

configDotenv({ path: '.env' });
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configuration().database.host,
  port: configuration().database.port,
  username: configuration().database.username,
  password: configuration().database.password,
  database: configuration().database.name,
  url: configuration().database.url,
  entities: [
    'dist/**/*.entity.js',
    // 'src/**/*.entity.ts', // enable when seeding and migrations
  ],
  migrations: [
    `dist/core/database/migrations/*.js`,
    // `src/core/database/migrations/*.ts`, // enable when seeding and migrations
  ],
  logger: 'simple-console',
  // logging: true, // remove when production
  // synchronize: false, // remove when production use migrations instead of synchronize
  // ssl: true, // remove when work on local
  // extra: { ssl: { rejectUnauthorized: false, require: true } }, // remove when work on local
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
