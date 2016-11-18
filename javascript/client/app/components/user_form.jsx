import React, {PropTypes} from 'react';
import _ from 'lodash';

const roles = ['user', 'manager', 'admin'];

export default class UserForm extends React.Component {
  render() {
    let {email, role} = {...this.props.user};
    let options = roles.map((role, index) => {
      return <option key={index} value={role}>{_.upperFirst(role)}</option>
    });
    return (
      <div onClick={e => e.stopPropagation()}>
        <div className="row">
          <span>{this.props.errorMessage}</span>
          <form className="col-xs-12" onSubmit={e => this.handleSubmit(e)}>
            <div className="form-group">
              <input className="form-control" ref="email" type="text" placeholder="Username" defaultValue={email} />
            </div>
            <div className="form-group">
              <input className="form-control" ref="password" type="password" placeholder="Password" />
            </div>
            <div className="form-group">
              <select className="form-control" ref="role" defaultValue={role}>
                {options}
              </select>
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
      email: this.refs.email.value,
      role: this.refs.role.value
    };

    if(this.refs.password.value) {
      out.password = this.refs.password.value;
    }
    //pull values out of form inputs and place them over the itinerary
    this.props.onSave({
      ...this.props.user,
      ...out
    });
  }
}

UserForm.propTypes = {
  onSave: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  user: PropTypes.object
};
