import React, {PropTypes} from 'react'
import _ from 'lodash';
import Datetime from 'react-datetime';
import moment from 'moment';

export default class ItineraryForm extends React.Component {
  render() {
    let {destination, start_date, end_date, comment} = {...this.props.itinerary};
                //create a default object if undefined ^^^^^^^^^^^^^^^^^^^^^^^^^
                //to handle optional default values
    return (
      <div>
        <div className="row">
          <span>{this.props.errorMessage}</span>
          <form className="col-xs-6" onSubmit={e => this.handleSubmit(e)}>
            <div className="form-group">
              <input className="form-control" ref="destination" type="text" placeholder="Destination" defaultValue={destination} />
            </div>
            <Datetime className="form-group" closeOnSelect={true} ref="start_date" placeholder="Start Date" defaultValue={moment(start_date)} />
            <Datetime className="form-group" closeOnSelect={true} ref="end_date" placeholder="End Date" defaultValue={moment(end_date)} />
            <div className="form-group">
              <input className="form-control" ref="comment" type="text" placeholder="Comment" defaultValue={comment} />
            </div>
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        </div>
      </div>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    let out = {
      destination: this.refs.destination.value,
      comment: this.refs.comment.value,
      start_date: this.refs.start_date.state.inputValue,
      end_date: this.refs.end_date.state.inputValue,
    };
    //pull values out of form inputs and place them over the itinerary
    this.props.onSave({
      ...this.props.itinerary,
      ...out
    });
  }
}

ItineraryForm.propTypes = {
  onSave: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  itinerary: PropTypes.object
};
