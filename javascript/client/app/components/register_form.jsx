import React, {PropTypes} from 'react'

export default class RegisterForm extends React.Component {
  render() {
    return (
      <div>
        <div className="row">
          <span>{this.props.errorMessage}</span>
          <form className="form-inline" onSubmit={e => this.handleSubmit(e)}>
            <input className="form-control" ref="username" placeholder="Username" />
            <input className="form-control" ref="password" type="password" placeholder="Password" />
            <button className="btn btn-primary" type="submit">Register</button>
          </form>
        </div>
      </div>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    let {username, password} = this.refs;

    this.props.onRegisterClick(username.value.trim(), password.value.trim());
  }
}

RegisterForm.propTypes = {
  onRegisterClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}
