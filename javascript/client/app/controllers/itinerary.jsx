import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import ItineraryList from '../components/itinerary_list';
import ItineraryForm from '../components/itinerary_form';
import ItineraryFilters from '../components/itinerary_filters';
import Datetime from 'react-datetime';
import { push } from 'react-router-redux';
import rest_client from '../rest_client';
import _ from 'lodash';

class ItineraryController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formHidden: true,
      filter: a => true
    };
  }

  componentDidMount() {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.userItineraries({id: this.props.activeUser.id}));
  }

  render() {
    let {itineraries} = this.props;

    //render list or placeholder text for empty list
    var list = <span>You have no travel plans.</span>;
    if(itineraries && !_.isEmpty(itineraries)) {
      let filtered_itineraries = _.filter(itineraries, this.state.filter);
      list = <ItineraryList
              itineraries={filtered_itineraries}
              onEdit={itinerary => this.onEdit(itinerary)}
              onDelete={itinerary => this.onDelete(itinerary)}/>;
    }

    //hideable add-itinerary form with list
    return (
      <div className="col-xs-12">
        <div className="row">
          <button className="btn btn-primary" onClick={e => this.toggleForm(e)}>Add Travel Plan</button>
          <button className="btn btn-secondary" onClick={e => this.props.dispatch(push('/print'))}>Print</button>
        </div>
        <div className="row">
          {!this.state.formHidden &&
          <ItineraryForm errorMessage={this.props.errorMessage} onSave={itinerary => this.onCreate(itinerary)} />}
        </div>
        <div className="row">
          <ItineraryFilters onChange={new_filter => this.onFilterChanged(new_filter)} />
        </div>
        <div className="row">
          {list}
        </div>
      </div>
    );
  }

  toggleForm(e) {
    this.setState({formHidden: !this.state.formHidden});
  }

  onFilterChanged(new_filter) {
    this.setState({filter: new_filter});
  }

  onEdit(itinerary) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.updateItinerary.send(itinerary));
  }

  onDelete(itinerary) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.deleteItinerary.send(itinerary));
  }

  onCreate(itinerary) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.createUserItinerary.send(this.props.activeUser.id, itinerary)).then(result => {
      this.setState({formHidden: true});
    }).catch(reason => console.log(reason));
  }
}

ItineraryController.propTypes = {
  dispatch: PropTypes.func.isRequired,
  activeUser: PropTypes.object.isRequired,
  itineraries: PropTypes.object,
  errorMessage: PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    itineraries: _.pickBy(state.itineraries.by_id, itinerary => state.users.active_user == itinerary.user_id),
    errorMessage: state.itineraries.error,
    activeUser: state.users.by_id[state.users.active_user]
  };
};

export default connect(mapStateToProps)(ItineraryController);
