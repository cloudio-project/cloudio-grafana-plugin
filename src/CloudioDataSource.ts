import defaults from 'lodash/defaults';

import {
    DataQueryRequest,
    DataQueryResponse,
    DataSourceApi,
    DataSourceInstanceSettings, dateTimeParse,
    FieldType,
    MutableDataFrame,
} from '@grafana/data';

import {getBackendSrv} from '@grafana/runtime';

import {CloudioDataSourceOptions, CloudioQuery, defaultQuery} from './types';

export class CloudioDataSource extends DataSourceApi<CloudioQuery, CloudioDataSourceOptions> {

    private readonly url?: string;

    constructor(instanceSettings: DataSourceInstanceSettings<CloudioDataSourceOptions>) {
        super(instanceSettings);
        this.url = instanceSettings.url
    }

    private async doGetRequest(path: string) {
        return await getBackendSrv().get(this.url + '/api/v1' + path);
    }

    async getEndpoints(): Promise<Array<any>> {
        return this.doGetRequest('/endpoints')
    }

    async getDataModel(endpointUUID: string): Promise<Array<any>> {
        return this.doGetRequest('/data/' + endpointUUID);
    }

    query(options: DataQueryRequest<CloudioQuery>): Promise<DataQueryResponse> {
        const {range, maxDataPoints, intervalMs} = options;
        const from = range!.from.toISOString();
        const to = range!.to.toISOString();

        // Return a constant for each query.
        const data = options.targets.map(target => {
            const query = defaults(target, defaultQuery);

            return this.doGetRequest('/history/' + query.endpointUUID + '/' + query.attribute +
                '?from=' + from +
                '&to=' + to +
                '&max=' + maxDataPoints +
                '&resampleInterval=' + intervalMs + 'ms')
                .then((result: Array<any>) => {
                    console.log(result);
                    return new MutableDataFrame({
                        refId: query.refId,
                        fields: [
                            {name: 'Time', values: result.map(r => dateTimeParse(r.time)), type: FieldType.time},
                            {name: query.endpointFriendlyName + ': ' + query.attribute, values: result.map(r => r.value), type: FieldType.number},
                        ],
                    });
                });
        });

        return Promise.all(data).then(data => {
                console.log(data);
                return {data};
            });
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
            return {
                status: 'error',
                message: 'HTTP error ' + error.status + ': ' + error.statusText + '.'
            }
        }
    }
}
