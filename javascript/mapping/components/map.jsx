import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {GoogleMap, withGoogleMap, Marker} from 'react-google-maps';
import {MAP} from 'react-google-maps/lib/constants';
import _ from 'lodash';

const GMapComponent = withGoogleMap(props => {
    return (
        <GoogleMap ref={props.onMapLoad} defaultZoom={1} defaultCenter={{lat: 0, lng: 0}}>
            {props.markers.map(marker => <Marker {...marker}/>)}
        </GoogleMap>
    )
})

class MapComponent extends React.Component {
    render() {
        return (
            <div style={{height: '100%', width: '100%'}}>
                <GMapComponent
                    onMapLoad={map => this.onMapLoad(map)}
                    containerElement={<div style={{ height: `100%` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                    markers={this.props.markers.map((marker, i) => {return {position: marker.position, key: i}})}
                />
            </div>
        );
    }

    onMapLoad(map) {
        if(!this.props.markers.length && map) {
            map.context[MAP].setCenter({lat: 0, lng: 0});
            map.context[MAP].setZoom(3);
        } else if(map) {
            let bounds = _(this.props.markers).reduce((bounds, marker) => {
                bounds.extend(marker.position);
                return bounds;
            }, new google.maps.LatLngBounds());

            map.fitBounds(bounds);

            if(this.props.maxZoom && map.getZoom() > this.props.maxZoom) {
                map.context[MAP].setZoom(this.props.maxZoom);
            }
        }
    }
}

MapComponent.propTypes = {
    markers: PropTypes.array.isRequired,
    maxZoom: PropTypes.number
}

let mapStateToProps = (state) => {
    return {
        markers: state.addresses.markers
    }
}

export default connect(mapStateToProps)(MapComponent);
