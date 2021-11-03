import { DataQuery, DataSourceJsonData } from '@grafana/data';

export enum CloudioResampleFunction {
  COUNT = 'COUNT',
  DISTINCT = 'DISTINCT',
  INTEGRAL = 'INTEGRAL',
  MEAN = 'MEAN',
  MEDIAN = 'MEDIAN',
  MODE = 'MODE',
  SPREAD = 'SPREAD',
  STDDEV = 'STDDEV',
  SUM = 'SUM',
  FIRST = 'FIRST',
  LAST = 'LAST',
  MAX = 'MAX',
  MIN = 'MIN'
}

export enum CloudioAttributeType {
  BOOLEAN = 'Boolean',
  INTEGER = 'Integer',
  NUMBER = 'Number',
  STRING = 'String'
}

export enum CloudioAttributeConstraint {
  STATIC = 'Static',
  PARAMETER = 'Parameter',
  STATUS = 'Status',
  SET_POINT = 'SetPoint',
  MEASURE = 'Measure'
}

export type CloudioEndpoint = {
  uuid: string,
  friendlyName: string
}

export type CloudioAttribute = {
  path: string,
  type: CloudioAttributeType,
  constraint: CloudioAttributeConstraint
}

export enum CloudioLogLevel {
  OFF = 'OFF',
  FATAL = 'FATAL',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
  ALL = 'ALL'
}

export interface CloudioQuery extends DataQuery {
  endpoint?: CloudioEndpoint
  attribute?: CloudioAttribute
  logLevel?: CloudioLogLevel
  resampleFunction: CloudioResampleFunction
}

export const defaultQuery: Partial<CloudioQuery> = {
  resampleFunction: CloudioResampleFunction.MEAN
};

export interface CloudioDataSourceOptions extends DataSourceJsonData {}

export interface CloudioSecureJsonData {}
