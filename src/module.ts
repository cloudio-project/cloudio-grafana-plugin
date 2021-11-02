import { DataSourcePlugin } from '@grafana/data';
import { CloudioDataSource } from './CloudioDataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { CloudioQuery, CloudioDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<CloudioDataSource, CloudioQuery, CloudioDataSourceOptions>(CloudioDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
