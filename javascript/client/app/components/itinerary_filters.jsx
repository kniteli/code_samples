import React, {PropTypes} from 'react'
import _ from 'lodash';
import Datetime from 'react-datetime';
import moment from 'moment';

export default class ItineraryFilters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formHidden: true,
      destFilter: a => true,
      startFilter: a => true,
      endFilter: a => true
    };
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <button className="btn btn-secondary" onClick={e => this.toggleForms(e)}>Filters</button>
        </div>
        <div className="row">
          {!this.state.formHidden &&
          <div className="form-inline">
            <input className="form-control" type="text" ref="dest_filter" onChange={e => this.filterDestChanged(e)} placeholder="Filter by destination" />
            <Datetime className="form-group" closeOnSelect={true} onChange={date => this.filterStartDateChanged(date)} inputProps={{placeholder: "Filter by start date"}} />
            <Datetime className="form-group" closeOnSelect={true} onChange={date => this.filterEndDateChanged(date)} inputProps={{placeholder: "Filter by end date"}} />
          </div>}
        </div>
      </div>
    );
  }

  toggleForms(e) {
    this.setState({formHidden: !this.state.formHidden});
  }

  //our filter change functions compose the current filter state into a single
  //filter for application whenever they change
  filterStartDateChanged(date) {
    var func = a => true;
    if(moment.isMoment(date)) {
      func = it => moment(it.start_date).isAfter(date);
    }
    this.setState({startFilter: func})
    let {destFilter, endFilter} = this.state;
    this.props.onChange(it => destFilter(it) && func(it) && endFilter(it));
  }

  filterEndDateChanged(date) {
    var func = a => true;
    if(moment.isMoment(date)) {
      func = it => moment(it.end_date).isBefore(date);
    }
    this.setState({endFilter: func});
    let {destFilter, startFilter} = this.state;
    this.props.onChange(it => destFilter(it) && startFilter(it) && func(it));
  }

  filterDestChanged(e) {
    var func = a => true;
    if(this.refs.dest_filter.value) {
      func = it => it.destination.indexOf(this.refs.dest_filter.value) !== -1;
    }
    this.setState({destFilter: func});
    let {startFilter, endFilter} = this.state;
    this.props.onChange(it => func(it) && startFilter(it) && endFilter(it));
  }
}

ItineraryFilters.propTypes = {
  onChange: PropTypes.func.isRequired,
};
