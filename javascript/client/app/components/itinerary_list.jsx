import React, {PropTypes} from 'react';
import ItineraryForm from './itinerary_form';
import moment from 'moment';

export default class ItineraryList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {formViews: {}};
  }
  render() {
    let list = this.props.itineraries.map(itinerary => {
      let [start_date, end_date] = [moment(itinerary.start_date), moment(itinerary.end_date)];
      return <li className="list-group-item" key={itinerary.id}>
        <ul>
          <li><strong>Destination: </strong>{itinerary.destination}</li>
          <li><strong>Start Date: </strong>{start_date.format('MM/DD/YYYY hh:mm A')}</li>
          <li><strong>End Date: </strong>{end_date.format('MM/DD/YYYY hh:mm A')}</li>
          {itinerary.comment &&
            <li><strong>Comment: </strong>{itinerary.comment}</li>
          }
          {start_date.isAfter(moment()) &&
          <li><strong>Starts {start_date.fromNow()}</strong></li>}
          <li>
            <button className="btn btn-secondary" onClick={e => this.toggleForm(itinerary.id)}>Edit</button>
            <button className="btn btn-secondary" onClick={e => this.props.onDelete(itinerary)}>Delete</button>
          </li>
        </ul>
        {this.state.formViews[itinerary.id] &&
        <ItineraryForm onSave={itinerary => this.saveEdit(itinerary)} itinerary={itinerary} />
        }
      </li>;
    });
    return <ul className="list-group">{list}</ul>;
  }

  saveEdit(itinerary) {
    this.toggleForm(itinerary.id);
    this.props.onEdit(itinerary);
  }

  toggleForm(id) {
    this.setState({
      formViews: {
        ...this.state.form_views,
        [id]: !this.state.formViews[id]
      }
    });
  }
}

ItineraryList.propTypes = {
  itineraries: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
