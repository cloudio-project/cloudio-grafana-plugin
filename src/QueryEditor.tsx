import React, {PureComponent} from 'react';
import {AsyncSelect, InlineFormLabel} from '@grafana/ui';
import {QueryEditorProps, SelectableValue} from '@grafana/data';
import {CloudioDataSource} from './CloudioDataSource';
import {CloudioDataSourceOptions, CloudioQuery} from './types';

type Props = QueryEditorProps<CloudioDataSource, CloudioQuery, CloudioDataSourceOptions>;

interface State {
    endpointSelected: boolean
}

export class QueryEditor extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            endpointSelected: (this.props.query.endpointUUID || '') !== ''
        }
    }

    private loadEndpointUUIDs = () => this.props.datasource.getEndpoints()
        .then((endpoints: Array<any>) => endpoints.map((endpoint: any) => {
            return {
                label: endpoint['friendlyName'],
                value: endpoint['uuid']
            } as SelectableValue<string>
        }));

    private onEndpointChanged = (selected: SelectableValue<string>) => {
        const {onChange, query} = this.props;
        onChange({...query, endpointFriendlyName: selected.label, endpointUUID: selected.value, attribute: undefined})
        this.setState({
            endpointSelected: true
        })
    }

    private extractAttributes(nodeName: string, objectName: string, obj: any, attributes: Array<{ label: string, value: string }>) {
        for (const [attributeName] of Object.entries((obj as any)['attributes'])) {
            attributes.push({
                label: nodeName + '/' + objectName + '/' + attributeName,
                value: nodeName + '/' + objectName + '/' + attributeName
            });
        }
        for (const [childObjectName, childObj] of Object.entries((obj as any)['objects'])) {
            this.extractAttributes(nodeName, objectName + '.' + childObjectName, childObj, attributes);
        }
    }

    private loadEndpointAttributes = () => this.props.datasource.getDataModel(this.props.query.endpointUUID!).then((model: any) => {
        const attributes = Array<{ label: string, value: string }>();
        const nodes = model['nodes'] || {};
        for (const [nodeName, node] of Object.entries(nodes)) {
            for (const [objectName, obj] of Object.entries((node as any)['objects'])) {
                this.extractAttributes(nodeName, objectName, obj, attributes);
            }
        }
        return attributes.map((attribute) => {
            return attribute as SelectableValue<string>
        });
    })

    private onAttributeChanged = (selected: SelectableValue<string>) => {
        const {onChange, query} = this.props;
        onChange({...query, attribute: selected.value})
        this.props.onRunQuery();
    }

    render() {
        const {query} = this.props;

        return (
            <div className="gf-form">
                <InlineFormLabel width={4}>Endpoint</InlineFormLabel>
                <AsyncSelect
                    width={32}
                    loadOptions={this.loadEndpointUUIDs}
                    defaultOptions={true}
                    value={{label: query.endpointFriendlyName, value: query.endpointUUID}}
                    onChange={this.onEndpointChanged}
                />
                &nbsp;
                <InlineFormLabel width={4}>Attribute</InlineFormLabel>
                <AsyncSelect
                    key={query.endpointUUID}
                    width={64}
                    disabled={!this.state.endpointSelected}
                    loadOptions={this.loadEndpointAttributes}
                    defaultOptions={this.state.endpointSelected}
                    value={{label: query.attribute, value: query.attribute}}
                    onChange={this.onAttributeChanged}
                />
            </div>
        );
    }
}
