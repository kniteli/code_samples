import {googleMaps} from 'utils';
import axios from 'axios';
import _ from 'lodash';

const stringify_address = (address) => address.address_1 + ', ' + address.city + ', ' + address.state + ' ' + address.zip;
const geocode_async = (address) => new Promise((resolve, reject) => {
    googleMaps.geocode({address: stringify_address(address)}, (err, res) => {
        if(err) {

        } else {
            resolve({address_id: address.id, res: res});
        }
    })
});
export const load_markers = (addresses) => {
    return dispatch => {
        Promise.all(addresses.map(geocode_async)).then(geodata => {
            //extract lat lng info and dispatch
            dispatch(markers_loaded(geodata.map(details => {
                return {
                    position: details.res.json.results[0].geometry.location,
                    id: details.address_id
                }
            })));
        })
    }
}

export const MARKERS_LOADED_ACTION = 'MARKERS_LOADED';
export const markers_loaded = (markers) => {
    return {
        type: MARKERS_LOADED_ACTION,
        markers: markers
    }
}

export const CREATE_MARKER_ACTION = 'CREATE_MARKER';
export const create_marker = (marker) => {
    return {
        type: CREATE_MARKER_ACTION,
        marker: marker
    }
}

export const UPDATE_MARKER_ACTION = 'UPDATE_MARKERS';
export const update_marker = (marker) => {
    return {
        type: UPDATE_MARKER_ACTION,
        marker: marker
    }
}

export const ADDRESSES_LOADED_ACTION = 'ADDRESSES_LOADED';
export const addresses_loaded = (addresses) => {
    return {
        type: ADDRESSES_LOADED_ACTION,
        addresses: addresses
    }
}

export const LOAD_ADDRESSES_ACTION = 'LOAD_ADDRESSES';
export const load_addresses = () => (dispatch, getState) => {
    //in real app this would be an axios call to the server
    dispatch(addresses_loaded(getState().addresses.all));
}

export const PERSIST_ADDRESSES_ACTION = 'PERSIST_ADDRESSES';
export const persist_addresses = (addresses) => (dispatch) => {
    //in real app this wouldn't be a dead endpoint.
    axios.put('/addresses', {addresses: addresses.map(address => _.omit(address, 'id'))}).then(response => {
        // let addresses = response.data.addresses.map((address, index) => {return {...address, id: index}});
        // dispatch(addresses_loaded(addresses));
        // dispatch(load_markers(addresses));
    }).catch(error => {
        //we don't actually have an api
        console.log(error);
    })
}

export const CREATE_ADDRESS_ACTION = 'CREATE_ADDRESS';
export const create_address = () => {
    return {
        type: CREATE_ADDRESS_ACTION
    }
}

export const CANCEL_NEW_ADDRESS_ACTION = 'CANCEL_NEW_ADDRESS';
export const cancel_new_address = () => {
    return {
        type: CANCEL_NEW_ADDRESS_ACTION
    }
}

export const SAVE_NEW_ADDRESS_ACTION = 'SAVE_NEW_ADDRESS';
export const save_new_address_complete = (address) => {
    return {
        type: SAVE_NEW_ADDRESS_ACTION,
        address: address
    }
}
export const save_new_address = (address) => (dispatch, getState) => {
    geocode_async(address).then(place_details => {
        if(place_details.res.json.results.length) {
            dispatch(create_marker({
                position: place_details.res.json.results[0].geometry.location,
                id: address.id
            }));
        }
        dispatch(persist_addresses([...getState().addresses.all, address]));
        dispatch(save_new_address_complete(address));
    }).catch((reason) => {
        console.log(reason);
    })
}

export const SAVE_EDIT_ADDRESS_ACTION = 'SAVE_EDIT_ADDRESS';
export const save_edit_address_complete = (address) => {
    return {
        type: SAVE_EDIT_ADDRESS_ACTION,
        address: address
    }
}
export const save_edit_address = (address) => (dispatch, getState) => {
    dispatch(persist_addresses([...getState().addresses.all.slice(0, address.id), address, ...getState().addresses.all.slice(address.id+1)]));
    geocode_async(address).then(place_details => {
        if(place_details.res.json.results.length) {
            dispatch(update_marker({
                position: place_details.res.json.results[0].geometry.location,
                id: address.id
            }))
        }
    });
    dispatch(save_edit_address_complete(address));
}

export const DELETE_ADDRESS_ACTION = 'DELETE_ADDRESS';
export const delete_address = (id) => {
    return {
        type: DELETE_ADDRESS_ACTION,
        id: id
    }
}

const places_search_service = new google.maps.places.AutocompleteService();
const places_details_service = new google.maps.places.PlacesService(document.createElement('div'));
export const SEARCH_ADDRESS_ACTION = 'SEARCH_ADDRESS';
export const search_address = (address) => {
    return dispatch => {
        dispatch(search_address_pending(address));
        if(!address) {
            dispatch(search_address_complete([]));
        } else {
            places_search_service.getPlacePredictions({input: address}, (res, status) => {
                if(!(status === google.maps.places.PlacesServiceStatus.OK)) {

                } else {
                    dispatch(search_address_complete(res.map(place => {return {main: place.structured_formatting.main_text, secondary: place.structured_formatting.secondary_text, id: place.place_id}})));
                }
            });
        }
    }
}

export const SEARCH_ADDRESS_EDIT_COMPLETE_ACTION = 'SEARCH_ADDRESS_EDIT_COMPLETE';
export const search_address_edit_complete = (address) => {
    return {
        type: SEARCH_ADDRESS_EDIT_COMPLETE_ACTION,
        address: address
    }
}

export const SEARCH_ADDRESS_COMPLETE_ACTION = 'SEARCH_ADDRESS_COMPLETE';
export const search_address_complete = (address_list) => {
    return {
        type: SEARCH_ADDRESS_COMPLETE_ACTION,
        candidates: address_list
    }
}

export const SEARCH_ADDRESS_PENDING_ACTION = 'SEARCH_ADDRESS_PENDING';
export const search_address_pending = (address) => {
    return {
        type: SEARCH_ADDRESS_PENDING_ACTION,
        address: address
    }
}

const extract_address_from_search_details = (details) => {
    let address = {
        address_1: details.name,
        label: 'business'
    }
    _(details.address_components).forEach(component => {
        switch(component.types[0]) {
            case 'locality':
                address.city = component.long_name;
            break;
            case 'administrative_area_level_1':
                address.state = component.short_name;
            break;
            case 'country':
                address.country = component.short_name;
            break;
            case 'postal_code':
                address.zip = component.short_name;
            break;
        }
    });
    return address;
}

export const SEARCH_ADDRESS_EDIT_ACTION = 'SEARCH_ADDRESS_EDIT_ACTION';
export const search_address_edit = (id) => (dispatch, getState) => {
    places_details_service.getDetails({placeId: id}, (res, status) => {
        if(!(status === google.maps.places.PlacesServiceStatus.OK)) {

        } else {
            let address = extract_address_from_search_details(res);
            address.id = getState().addresses.all.length;
            dispatch(search_address_edit_complete(address));
        }
    })
}


export const CREATE_ADDRESS_FROM_PLACE_ACTION = 'CREATE_ADDRESS_FROM_PLACE';
export const create_address_from_place = (id) => (dispatch, getState) => {
    let state = getState();
    places_details_service.getDetails({placeId: id}, (res, status) => {
        if(!(status === google.maps.places.PlacesServiceStatus.OK)) {

        } else {
            let address = extract_address_from_search_details(res);
            address.id = state.addresses.all.length;
            dispatch(persist_addresses([...getState().addresses.all, address]))
            dispatch(save_new_address_complete(address));
            dispatch(create_marker({
                position: {lat: res.geometry.location.lat(), lng: res.geometry.location.lng()},
                id: address.id
            }));
        }
    });
}
