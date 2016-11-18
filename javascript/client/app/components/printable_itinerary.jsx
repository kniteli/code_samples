import React, {PropTypes} from 'react';
import ItineraryForm from './itinerary_form';
import moment from 'moment';

export default class PrintableItinerary extends React.Component {
  render() {
    let rows = this.props.itineraries.map(itinerary => {
      let [start_date, end_date] = [moment(itinerary.start_date), moment(itinerary.end_date)];
      return (
        <tr key={itinerary.id}>
          <td>{itinerary.destination}</td>
          <td>{start_date.format('MM/DD/YYYY hh:mm A')}</td>
          <td>{end_date.format('MM/DD/YYYY hh:mm A')}</td>
          <td>{itinerary.comment}</td>
        </tr>
      );
    });
    return (
      <div>
        <h1>Your itinerary for the month</h1>
        <table>
          <thead>
            <tr>
              <th>Destination</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}

PrintableItinerary.propTypes = {
  itineraries: PropTypes.array.isRequired
};
