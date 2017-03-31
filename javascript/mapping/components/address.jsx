import React, {PropTypes} from 'react';
import {country_list} from 'utils';

const label_map = {
    business: 'label-primary',
    mailing: 'label-warning',
    other: 'label-success'
}

export default class AddressComponent extends React.Component {
    render() {
        let {address_1, address_2, city, state, zip, country, label} = this.props.address;
        let classes = `label ${label_map[label]}`;
        return (
            <div>
                <div className={classes}>{label}</div>
                <div>{address_1}</div>
                {address_2 &&
                <div>{address_2}</div>}
                <div>{city}, {state} {zip}</div>
                <div>{country_list[country].name}</div>
            </div>
        );
    }
}

AddressComponent.propTypes = {
    address: PropTypes.object.isRequired
}
