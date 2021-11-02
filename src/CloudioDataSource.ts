import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';

import { getBackendSrv } from '@grafana/runtime';

import { CloudioDataSourceOptions, CloudioQuery, defaultQuery } from './types';

export class CloudioDataSource extends DataSourceApi<CloudioQuery, CloudioDataSourceOptions> {

  private readonly url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<CloudioDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url
  }

  private async doGetRequest(path: string) {
    return await getBackendSrv().get(this.url + '/api/v1' + path);
  }

  async query(options: DataQueryRequest<CloudioQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
        ],
      });
    });

    return { data };
  }

  async testDatasource() {
    try {
      const result = await this.doGetRequest('/account');
      const authorities: Array<String> = result['authorities'] || []
      if (authorities.find((value) => value === 'HTTP_ACCESS') != undefined) {
        return {
          status: 'success',
          message: 'Data source is working.',
        };
      } else {
        return {
          status: 'error',
          message: 'Configured user does not have HTTP access.',
        };
      }

    } catch (error: any) {
      console.log(error)
      return {
        status: 'error',
        message: 'HTTP error ' + error.status + ': ' + error.statusText + '.'
      }
    }
  }
}
