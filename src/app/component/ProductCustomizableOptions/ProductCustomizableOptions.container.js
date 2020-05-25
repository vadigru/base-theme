/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatCurrency } from 'Util/Price';
import ProductCustomizableOptions from './ProductCustomizableOptions.component';

export class ProductCustomizableOptionsContainer extends PureComponent {
    static propTypes = {
        options: PropTypes.array,
        getRequiredCustomizableOptions: PropTypes.func.isRequired,
        getSelectedCustomizableOptions: PropTypes.func.isRequired
    };

    static defaultProps = {
        options: []
    };

    state = {
        isLoading: true,
        selectedCheckboxValues: [],
        selectedDropdownOptions: [],
        selectedFieldValue: [],
        selectedAreaValue: []
    };

    containerFunctions = {
        setCustomizableOptionFieldValue: this.setCustomizableOptionFieldValue.bind(this),
        setCustomizableOptionAreaValue: this.setCustomizableOptionAreaValue.bind(this),
        setSelectedDropdownValue: this.setSelectedDropdownValue.bind(this),
        getDropdownOptions: this.getDropdownOptions.bind(this),
        setSelectedCheckboxValues: this.setSelectedCheckboxValues.bind(this)
    };

    componentDidUpdate(prevProps, prevState) {
        const { options } = this.props;
        const { options: prevOptions } = prevProps;
        const {
            selectedCheckboxValues,
            selectedDropdownOptions,
            selectedFieldValue,
            selectedAreaValue
        } = this.state;
        const {
            selectedCheckboxValues: prevSelectedCheckboxValues,
            selectedDropdownOptions: prevSelectedDropdownOptions,
            selectedFieldValue: prevFieldValue,
            selectedAreaValue: prevAreaValue
        } = prevState;

        if (options) {
            this.stopLoading();
        }

        if (options !== prevOptions) {
            this.getRequiredOptionsData(options);
        }

        if (selectedCheckboxValues !== prevSelectedCheckboxValues) {
            this.updateSelectedOptionsArray();
        }

        if (selectedFieldValue !== prevFieldValue
            || selectedAreaValue !== prevAreaValue
            || selectedDropdownOptions !== prevSelectedDropdownOptions
        ) {
            this.updateSelectedOptions();
        }
    }

    stopLoading() {
        this.setState({ isLoading: false });
    }

    async updateSelectedOptionsArray() {
        const { getSelectedCustomizableOptions } = this.props;
        const { selectedCheckboxValues } = this.state;
        const customizable_options = [];

        if (selectedCheckboxValues.length) {
            selectedCheckboxValues.map(item => customizable_options.push(item));
        }

        getSelectedCustomizableOptions(customizable_options, true);
    }

    async updateSelectedOptions() {
        const { getSelectedCustomizableOptions } = this.props;
        const {
            selectedDropdownOptions,
            selectedFieldValue,
            selectedAreaValue
        } = this.state;
        const customizable_options = [];

        if (selectedFieldValue.length) {
            selectedFieldValue.map(item => customizable_options.push(item));
        }

        if (selectedAreaValue.length) {
            selectedAreaValue.map(item => customizable_options.push(item));
        }

        if (selectedDropdownOptions.length) {
            selectedDropdownOptions.map(item => customizable_options.push(item));
        }

        getSelectedCustomizableOptions(customizable_options);
    }

    getRequiredOptionsData(options) {
        const { getRequiredCustomizableOptions } = this.props;
        const optionData = [];

        options.map(({ option_id, required }) => {
            if (required) {
                return optionData.push({ option_id });
            }

            return null;
        });

        getRequiredCustomizableOptions(optionData);
    }

    setCustomizableOptionFieldValue(option_id, option_value) {
        if (option_value) {
            this.setState({ selectedFieldValue: [{ option_id, option_value }] });
        } else {
            this.setState({ selectedFieldValue: [] });
        }
    }

    setCustomizableOptionAreaValue(option_id, option_value) {
        if (option_value) {
            this.setState({ selectedAreaValue: [{ option_id, option_value }] });
        } else {
            this.setState({ selectedAreaValue: [] });
        }
    }

    setSelectedCheckboxValues(option_id, option_value) {
        const { selectedCheckboxValues } = this.state;
        const selectedValue = { option_id, option_value };

        if (selectedCheckboxValues.some(item => option_value === item.option_value)) {
            this.setState({
                selectedCheckboxValues: selectedCheckboxValues.filter(value => value.option_value !== option_value)
            });
        } else {
            this.setState({
                selectedCheckboxValues: [...selectedCheckboxValues, selectedValue]
            });
        }
    }

    setSelectedDropdownValue(value = null, option_id) {
        const { options } = this.props;
        const optionData = [];

        if (!value) {
            return this.setState({ selectedDropdownOptions: [] });
        }

        options.map(({ dropdownValues }) => {
            if (dropdownValues) {
                dropdownValues.map(({ option_type_id: option_value, price }) => {
                    if (price === value) {
                        return optionData.push({ option_id, option_value });
                    }

                    return null;
                });
            }

            return null;
        });

        return this.setState({ selectedDropdownOptions: optionData });
    }

    getDropdownOptions(values) {
        const data = [];

        values.map(({
            option_type_id, title, price, price_type
        }) => (
            data.push({
                id: option_type_id,
                name: title,
                value: price,
                label: `${ title } + `,
                labelBold: price_type === 'PERCENT' ? `${ price }%` : `${ formatCurrency() }${ price }`
            })
        ));

        return data;
    }

    render() {
        return (
            <ProductCustomizableOptions
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(null)(ProductCustomizableOptionsContainer);
