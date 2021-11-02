import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface CloudioQuery extends DataQuery {
  queryText?: string;
  constant: number;
}

export const defaultQuery: Partial<CloudioQuery> = {
  constant: 6.5,
};

/**
 * These are options configured for each DataSource instance
 */
export interface CloudioDataSourceOptions extends DataSourceJsonData {
  scheme?: string;
  host?: string;
  username?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface CloudioSecureJsonData {
  password?: string;
}
