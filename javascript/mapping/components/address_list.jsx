import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {AddressListItemComponent, AddressFormComponent, PlaceSearchFormComponent, PlaceSearchResultsComponent} from 'components';
import {create_address, save_new_address, save_edit_address, delete_address, load_markers, create_address_from_place, cancel_new_address} from 'actions';
import _ from 'lodash';

class AddressListComponent extends React.Component {
    render() {
        return (
            <div>
                <h4>Addresses</h4>
                {!this.props.editing &&
                <div>
                    <PlaceSearchFormComponent />
                    <div className="manual-add">
                        <div onClick={e => this.props.createNewAddress()}>
                            <i className="material-icons">add</i>
                            <div>Add Manually</div>
                        </div>
                    </div>
                </div>}
                {this.props.editing &&
                <AddressFormComponent address={this.props.editing} onCancel={() => this.props.cancelNewAddress()} onSave={address => this.props.saveNewAddress(address)}/>}
                <ul id="address_list">
                    {_(this.props.addresses).map(address => <li className="well" key={address.id}>
                                                                <AddressListItemComponent
                                                                address={address}
                                                                saveAddress={address => this.props.saveEditAddress(address)}
                                                                deleteAddress={id => this.props.deleteAddress(id)} />
                                                            </li>).value()}
                </ul>
            </div>
        );
    }
}

AddressListComponent.propTypes = {
    addresses: PropTypes.array.isRequired,
    createNewAddress: PropTypes.func.isRequired,
    cancelNewAddress: PropTypes.func.isRequired,
    saveNewAddress: PropTypes.func.isRequired,
    saveEditAddress: PropTypes.func.isRequired,
    deleteAddress: PropTypes.func.isRequired,
    createAddressFromPlace: PropTypes.func.isRequired
}

let mapStateToProps = (state) => {
    return {
        addresses: state.addresses.all,
        editing: state.addresses.editing,
        candidates: state.addresses.search_results
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        createNewAddress: () => {
            dispatch(create_address());
        },
        saveNewAddress: (address) => {
            dispatch(save_new_address(address));
        },
        saveEditAddress: (address) => {
            dispatch(save_edit_address(address));
        },
        cancelNewAddress: () => {
            dispatch(cancel_new_address());
        },
        deleteAddress: (id) => {
            dispatch(delete_address(id));
        },
        loadMarkers: (addresses) => {
            dispatch(load_markers(addresses));
        },
        createAddressFromPlace: (id) => {
            dispatch(create_address_from_place(id));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddressListComponent);
