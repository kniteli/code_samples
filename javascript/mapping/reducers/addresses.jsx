import {
    ADDRESSES_LOADED_ACTION,
    CREATE_ADDRESS_ACTION,
    EDIT_ADDRESS_ACTION,
    SAVE_NEW_ADDRESS_ACTION,
    SAVE_EDIT_ADDRESS_ACTION,
    CANCEL_NEW_ADDRESS_ACTION,
    DELETE_ADDRESS_ACTION,
    MARKERS_LOADED_ACTION,
    CREATE_MARKER_ACTION,
    UPDATE_MARKER_ACTION,
    SEARCH_ADDRESS_PENDING_ACTION,
    SEARCH_ADDRESS_EDIT_COMPLETE_ACTION,
    SEARCH_ADDRESS_COMPLETE_ACTION
} from 'actions';
import _ from 'lodash';

export const create_address = (id, street_1 = '', street_2 = '', city = '', state = '', postal_code = '', country = '', type = 'business') => {
    return {
        id: id,
        address_1: street_1,
        address_2: street_2,
        city: city,
        state: state,
        zip: postal_code,
        country: country,
        label: type
    }
}

const default_addresses = {
    all: [],
    editing: null,
    markers: [],
    search_string: '',
    search_results: []
}

export default function addresses(state = default_addresses, action) {
    switch (action.type) {
        case ADDRESSES_LOADED_ACTION:
            //we need to keep track of our addresses for deletion and updating
            return {
                ...state,
                all: action.addresses,
                search_string: '',
                search_results: [],
                editing: null
            }
        break;
        case CREATE_ADDRESS_ACTION:
            return {
                ...state,
                editing: create_address(state.all.length)
            }
        break;
        case CANCEL_NEW_ADDRESS_ACTION:
            return {
                ...state,
                editing: null
            }
        break;
        case SAVE_NEW_ADDRESS_ACTION:
            return {
                ...state,
                all: [...state.all, action.address],
                search_results: [],
                search_string: '',
                editing: null
            }
        break;
        case SAVE_EDIT_ADDRESS_ACTION:
            //splice in update
            return {
                ...state,
                all: [
                    ...state.all.slice(0, action.address.id),
                    action.address,
                    ...state.all.slice(action.address.id + 1)
                ]
            }
        break;
        case DELETE_ADDRESS_ACTION:
            return {
                ...state,
                all: state.all.filter((address) => address.id !== action.id),
                markers: state.markers.filter(marker => marker.id !== action.id)
            }
        break;
        case MARKERS_LOADED_ACTION:
            return {
                ...state,
                markers: action.markers
            }
        break;
        case CREATE_MARKER_ACTION:
            return {
                ...state,
                markers: [...state.markers, action.marker]
            }
        break;
        case UPDATE_MARKER_ACTION:
            return {
                ...state,
                markers: [
                    ...state.markers.slice(0, action.marker.id),
                    action.marker,
                    ...state.markers.slice(action.marker.id+1)
                ]
            }
        break;
        case SEARCH_ADDRESS_PENDING_ACTION:
            return {
                ...state,
                search_string: action.address
            }
        break;
        case SEARCH_ADDRESS_EDIT_COMPLETE_ACTION:
            return {
                ...state,
                editing: action.address,
                search_results: [],
                search_string: ''
            }
        break;
        case SEARCH_ADDRESS_COMPLETE_ACTION:
            return {
                ...state,
                search_results: action.candidates
            }
        break;
        default:
            return state;
        break;
    }
}
