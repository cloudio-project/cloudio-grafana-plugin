import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface CloudioQuery extends DataQuery {
  endpointFriendlyName?: string;
  endpointUUID?: string;
  attribute?: string;
}

export const defaultQuery: Partial<CloudioQuery> = {};

export interface CloudioDataSourceOptions extends DataSourceJsonData {}

export interface CloudioSecureJsonData {}
