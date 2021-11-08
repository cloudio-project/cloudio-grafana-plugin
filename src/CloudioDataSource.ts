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
        const {range, interval, intervalMs} = options;
        const from = range!.from.toISOString();
        const to = range!.to.toISOString();
        const delta = (range!.to.unix() - range!.from.unix()) * 1000;

        // Return a constant for each query.
        const data = options.targets.map(target => {
            const query = defaults(target, defaultQuery);

            return this.doGetRequest('/history/' + query.endpoint?.uuid + '/' + query.attribute?.path +
                '?from=' + from +
                '&to=' + to +
                '&max=' + Math.floor(delta / intervalMs + 1) +
                '&resampleInterval=' + interval +
                '&resampleFunction=' + query.resampleFunction)
                .then((result: Array<any>) => {
                    return new MutableDataFrame({
                        refId: query.refId,
                        fields: [
                            {name: 'Time', values: result.map(r => dateTimeParse(r.time)), type: FieldType.time},
                            {name: query.endpoint?.friendlyName + ': ' + query.attribute?.path, values: result.map(r => r.value), type: FieldType.number},
                        ],
                    });
                });
        });

        return Promise.all(data).then(data => {
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
