import React from 'react';
import {AddressListComponent, MapComponent, PlaceSearchResultsComponent} from 'components';

export default class App extends React.Component {
    render() {
        return (
            <div className="container-fluid row" style={{height: "100%"}}>
                <div id="address_list_column" className="col-xs-4 col-md-2">
                    <AddressListComponent />
                </div>
                <div id="place_search_results" className="col-xs-offset-4 col-md-offset-2 affix">
                    <PlaceSearchResultsComponent />
                </div>
                <div className="col-xs-8 col-md-10" style={{height: "100%"}}>
                    <MapComponent maxZoom={8}/>
                </div>
            </div>
        );
    }
}
