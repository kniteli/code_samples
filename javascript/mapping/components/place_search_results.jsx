import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {create_address_from_place, search_address_edit} from 'actions';

class PlaceSearchResultsComponent extends React.Component {
    render() {
        let place_list = this.props.placeCandidates.map(place => <li className="address-list-item" key={place.id}>
                                                                    <div className="address-list-actions">
                                                                        <i style={{color: "#5cb85c"}} className="material-icons" onClick={e => this.props.onSelect(place)}>add</i>
                                                                        <i className="material-icons" onClick={e => this.props.onSelectEdit(place)}>edit</i>
                                                                    </div>
                                                                    <div>
                                                                        <div>
                                                                            {place.main}
                                                                        </div>
                                                                        <div>
                                                                            {place.secondary}
                                                                        </div>
                                                                    </div>
                                                                </li>)
        return (
            <div>
                {!!this.props.placeCandidates.length &&
                <ul>
                    {place_list}
                </ul>}
            </div>
        );
    }
}

PlaceSearchResultsComponent.propTypes = {
    placeCandidates: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSelectEdit: PropTypes.func.isRequired
}

let mapStateToProps = (state) => {
    return {
        placeCandidates: state.addresses.search_results
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        onSelect: (place) => {
            dispatch(create_address_from_place(place.id));
        },
        onSelectEdit: (place) => {
            dispatch(search_address_edit(place.id));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceSearchResultsComponent);
