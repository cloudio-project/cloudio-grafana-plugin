import React, {PureComponent} from 'react';
import {DataSourceHttpSettings} from '@grafana/ui';
import {DataSourcePluginOptionsEditorProps} from '@grafana/data';
import {CloudioDataSourceOptions} from './types';

interface Props extends DataSourcePluginOptionsEditorProps<CloudioDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
    render() {
        const { options, onOptionsChange } = this.props;

        return (
            <div className="gf-form-group">
                <DataSourceHttpSettings
                    defaultUrl="http://localhost:8080"
                    dataSourceConfig={options}
                    onChange={onOptionsChange}
                />
            </div>
        );
    }
}
