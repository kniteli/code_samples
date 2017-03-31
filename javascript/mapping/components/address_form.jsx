import React, {PropTypes} from 'react';
import {country_list} from 'utils';
import ReactSelect from 'react-select';
import _ from 'lodash';

const countries = _(country_list).map((country, code) => {return {value: code, label: country.name}}).value();
export default class AddressFormComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            country: 'US',
            validation: {
                street_1: false,
                city: false,
                state: false,
                postal_code: false
            }
        }
    }
    componentDidMount() {
        this.setState({country: this.props.address.country});
    }
    componentWillReceiveProps(nextProps) {
        this.setState({country: nextProps.address.country});
    }
    render() {
        let {address_1, address_2, city, state, zip, country, label} = this.props.address;
        let validate_field = (field) => {
            if(this.state.validation[field]) {
                return 'error';
            } else {
                return ''
            }
        }
        return (
            <form className="address-list-form" onSubmit={e => this.onSave(e)}>
                <div className="form-group">
                    <select ref="label" className="form-control" defaultValue={label}>
                        <option value="business">Business</option>
                        <option value="mailing">Mailing</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <input className={"form-control " + validate_field('street_1')} ref="street_1" type="text" defaultValue={address_1} placeholder="Address 1" />
                </div>
                <div className="form-group">
                    <input className="form-control" ref="street_2" type="text" defaultValue={address_2} placeholder="Address 2" />
                </div>
                <div className="form-group">
                    <input className={"form-control " + validate_field('city')} ref="city" type="text" defaultValue={city} placeholder="City" />
                </div>
                <div className="form-group">
                    <input className={"form-control " + validate_field('state')} ref="state" type="text" defaultValue={state} placeholder="State" />
                </div>
                <div className="form-group">
                    <input className={"form-control " + validate_field('postal_code')} ref="postal_code" type="text" defaultValue={zip} placeholder="Postal Code" />
                </div>
                <div className="form-group">
                    <ReactSelect ref="country" value={this.state.country} onChange={country => this.onChangeCountry(country.value)} options={countries} clearable={false}/>
                </div>
                <div className="pull-right">
                    <button className="btn btn-secondary" type="button" onClick={e => this.props.onCancel()}>Cancel</button>
                    <button className="btn btn-primary">Save</button>
                </div>
                <div className="clearfix"></div>
            </form>
        );
    }

    onChangeCountry(country) {
        this.setState({country: country});
    }

    onSave(e) {
        e.preventDefault();
        let {street_1, street_2, city, state, postal_code, label} = this.refs;
        let address = {
            ...this.props.address,
            address_1: street_1.value,
            address_2: street_2.value,
            city: city.value,
            state: state.value,
            zip: postal_code.value,
            label: label.value,
            country: this.state.country
        }

        let errors = {
            street_1: !address.address_1.toString().trim(),
            city: !address.city.toString().trim(),
            state: !address.state.toString().trim(),
            postal_code: !address.zip.toString().trim()
        }

        if(_(errors).reduce((acc, error) => acc || error, false)) {
            this.setState({validation: errors});
        } else {
            this.props.onSave(address);
        }
    }
}

AddressFormComponent.propTypes = {
    address: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
}
