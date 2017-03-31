import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {search_address} from 'actions';

class PlaceSearchFormComponent extends React.Component {
    render() {
        return (
            <input className="form-control" type="text" value={this.props.searchString} onChange={e => this.onChange(e)} placeholder="Add Address" />
        );
    }

    onChange(e) {
        this.props.searchAutocomplete(e.target.value);
    }

    // onSave(e) {
    //     e.preventDefault();
    //     let {street_1, street_2, city, state, postal_code, country} = this.refs;
    //     this.props.onSave(create_address(street_1.value, street_2.value, city.value, state.value, postal_code.value, country.value));
    // }
}

let mapStateToProps = (state) => {
    return {
        searchString: state.addresses.search_string
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        searchAutocomplete: (address) => {
            dispatch(search_address(address));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceSearchFormComponent);
