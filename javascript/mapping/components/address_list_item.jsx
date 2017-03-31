import React, {PropTypes} from 'react';
import {AddressComponent, AddressFormComponent} from 'components';
import {save_address} from 'actions';

/*
    Contains both the edit form (and related state) as well as the text display
    for addresses
*/
export default class AddressListItemComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing_address: false
        }
    }
    render() {
        return (
            <div>
                <div className="address-list-item">
                    <div>
                        <AddressComponent address={this.props.address} />
                    </div>
                    <div className="address-list-actions">
                        <i className="material-icons" onClick={e => this.toggleEditAddress()}>edit</i>
                        <i className="material-icons" onClick={e => this.props.deleteAddress(this.props.address.id)}>delete</i>
                    </div>
                </div>
                {this.state.editing_address &&
                <AddressFormComponent address={this.props.address} onCancel={() => this.setState({editing_address: false})} onSave={address => this.onSaveAddress(address)} />}
            </div>
        );
    }
    toggleEditAddress() {
        this.setState({editing_address: !this.state.editing_address});
    }
    onSaveAddress(address) {
        this.setState({editing_address: false});
        this.props.saveAddress(address);
    }
}

AddressListItemComponent.propTypes = {
    address: PropTypes.object.isRequired,
    saveAddress: PropTypes.func.isRequired,
    deleteAddress: PropTypes.func.isRequired
}
