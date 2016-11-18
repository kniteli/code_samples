import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import PrintableItinerary from '../components/printable_itinerary';
import rest_client from '../rest_client';
import _ from 'lodash';
import moment from 'moment';

class PrintController extends React.Component {
  componentDidMount() {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.userItineraries({id: this.props.activeUser.id}));
  }

  render() {
    let {itineraries} = this.props;
    return <PrintableItinerary itineraries={itineraries} />;
  }
}

PrintController.propTypes = {
  dispatch: PropTypes.func.isRequired,
  activeUser: PropTypes.object.isRequired,
  itineraries: PropTypes.array,
};

const mapStateToProps = (state) => {
  let itinerary = _.filter(state.itineraries.by_id, it => {
    return state.users.active_user === it.user_id &&
          moment(it.start_date).isAfter(moment()) &&
          moment(it.start_date).isBefore(moment().add(1, 'month'));
  }).sort((a, b) => {
    return moment(a.start_date).isBefore(moment(b.start_date))?-1:1;
  });
  return {
    itineraries: itinerary,
    activeUser: state.users.by_id[state.users.active_user]
  };
};

export default connect(mapStateToProps)(PrintController);
