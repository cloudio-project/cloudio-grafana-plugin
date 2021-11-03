import React, {PureComponent} from 'react';
import {AsyncSelect, InlineFormLabel, LegacyForms} from '@grafana/ui';
import {QueryEditorProps, SelectableValue} from '@grafana/data';
import {CloudioDataSource} from './CloudioDataSource';
import {CloudioAttribute, CloudioAttributeConstraint, CloudioAttributeType, CloudioDataSourceOptions, CloudioEndpoint, CloudioQuery, CloudioResampleFunction} from './types';

const {Select} = LegacyForms;

type Props = QueryEditorProps<CloudioDataSource, CloudioQuery, CloudioDataSourceOptions>;

interface State {
    endpointSelected: boolean
}

export class QueryEditor extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            endpointSelected: (this.props.query.endpoint?.uuid || '') !== ''
        }
    }

    private loadEndpointUUIDs = () => this.props.datasource.getEndpoints()
        .then((endpoints: Array<any>) => endpoints.map((endpoint: any) => {
                return {
                    label: endpoint['friendlyName'],
                    description: endpoint['uuid'],
                    value: {
                        uuid: endpoint['uuid'],
                        friendlyName: endpoint['friendlyName']
                    }
                } as SelectableValue<CloudioEndpoint>;
            })
        );

    private onEndpointChanged = (selected: SelectableValue<CloudioEndpoint>) => {
        const {onChange, query} = this.props;
        onChange({...query, endpoint: selected.value, attribute: undefined})
        this.setState({
            endpointSelected: true
        });
    }

    private extractAttributesRecursive(nodeName: string, objectName: string, obj: any, attributes: Array<SelectableValue<CloudioAttribute>>) {
        for (const [attributeName, attribute] of Object.entries((obj as any)['attributes'])) {
            if (((attribute as any)['type'] as CloudioAttributeType) === CloudioAttributeType.STRING) continue;
            attributes.push({
                label: nodeName + '/' + objectName + '/' + attributeName,
                description: (attribute as any)['type'],
                value: {
                    path: nodeName + '/' + objectName + '/' + attributeName,
                    type: (attribute as any)['type'] as CloudioAttributeType,
                    constraint: (attribute as any)['constraint'] as CloudioAttributeConstraint
                } as CloudioAttribute,
            });
        }
        for (const [childObjectName, childObj] of Object.entries((obj as any)['objects'])) {
            this.extractAttributesRecursive(nodeName, objectName + '.' + childObjectName, childObj, attributes);
        }
    }

    private loadEndpointAttributes = () => this.props.datasource.getDataModel(this.props.query.endpoint?.uuid!).then((model: any) => {
        const attributes = Array<SelectableValue<CloudioAttribute>>();
        const nodes = model['nodes'] || {};
        for (const [nodeName, node] of Object.entries(nodes)) {
            for (const [objectName, obj] of Object.entries((node as any)['objects'])) {
                this.extractAttributesRecursive(nodeName, objectName, obj, attributes);
            }
        }
        return attributes;
    })

    private onAttributeChanged = (selected: SelectableValue<CloudioAttribute>) => {
        const {onChange, query} = this.props;
        onChange({...query, attribute: selected.value});
        this.props.onRunQuery();
    }

    private readonly resampleFunctions: Array<SelectableValue<CloudioResampleFunction>> = [
        {label: "Mean value", value: CloudioResampleFunction.MEAN},
        {label: "Median value", value: CloudioResampleFunction.MEDIAN},
        {label: "Maximal value", value: CloudioResampleFunction.MAX},
        {label: "Minimal value", value: CloudioResampleFunction.MIN},
        {label: "Sum", value: CloudioResampleFunction.SUM},
        {label: "Most frequent value", value: CloudioResampleFunction.MODE},
        {label: "Standard deviation", value: CloudioResampleFunction.STDDEV},
        {label: "Integral", value: CloudioResampleFunction.INTEGRAL},
        {label: "First value", value: CloudioResampleFunction.FIRST},
        {label: "Last value", value: CloudioResampleFunction.LAST},
        {label: "Count values", value: CloudioResampleFunction.COUNT},
        {label: "Distinct values", value: CloudioResampleFunction.DISTINCT},
        {label: "Difference min-max", value: CloudioResampleFunction.SPREAD}
    ];

    private onResampleFunctionChanged = (selected: SelectableValue<CloudioResampleFunction>) => {
        const {onChange, query} = this.props;
        onChange({...query, resampleFunction: selected.value!});
        if ((query.endpoint?.uuid || '') !== '' && (query.attribute || '') !== '') {
            this.props.onRunQuery();
        }
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
                    value={{label: query.endpoint?.friendlyName, value: query.endpoint}}
                    onChange={this.onEndpointChanged}
                />
                &nbsp;
                <InlineFormLabel width={4}>Attribute</InlineFormLabel>
                <AsyncSelect
                    key={query.endpoint?.uuid}
                    width={64}
                    disabled={!this.state.endpointSelected}
                    loadOptions={this.loadEndpointAttributes}
                    defaultOptions={this.state.endpointSelected}
                    value={{label: query.attribute?.path, value: query.attribute}}
                    onChange={this.onAttributeChanged}
                />
                &nbsp;
                <InlineFormLabel width={5}>Resampling</InlineFormLabel>
                <Select
                    width={10}
                    options={this.resampleFunctions}
                    value={this.resampleFunctions.find((value => value.value === query.resampleFunction)) || this.resampleFunctions[0]}
                    onChange={this.onResampleFunctionChanged}
                />
            </div>
        );
    }
}
