import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import LoginForm from '../components/login_form';
import { push } from 'react-router-redux';
import { Link } from 'react-router';
import rest_client from '../rest_client';

class LoginController extends React.Component {
  render() {
    let {errorMessage} = this.props;
    return (
      <div className="row">
        <LoginForm errorMessage={errorMessage} onLoginClick={ (username, password) => this.handleLogin(username, password) } />
        <Link to="/register">Register</Link>
      </div>
    );
  }

  handleLogin(username, password) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.login(null, { body: JSON.stringify({ email: username, password: password })}))
    .then((result) => {
      dispatch(push('/'));
    }).catch(reason => console.log(reason));
  }
}

LoginController.propTypes = {
  dispatch: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    errorMessage: state.auth.error
  };
};

export default connect(mapStateToProps)(LoginController);
