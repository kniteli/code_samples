import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import RegisterForm from '../components/register_form';
import { push } from 'react-router-redux';
import rest_client from '../rest_client';

class RegistrationController extends React.Component {
  render() {
    let {errorMessage} = this.props;
    return (
      <div className="row">
        <RegisterForm errorMessage={errorMessage} onRegisterClick={ (username, password) => this.handleRegister(username, password) } />
      </div>
    );
  }

  handleRegister(username, password) {
    let {dispatch} = this.props;
    //register the user, log them in, and redirect them
    dispatch(rest_client.actions.createUser.send({email: username, password: password}))
    .then((result) => {
      dispatch(rest_client.actions.login(null, { body: JSON.stringify({email: username, password: password})}))
      .then(result => {
        dispatch(push('/'));
      }).catch(reason => { console.log(reason) });
    }).catch(reason => { console.log(reason) });
  }
}

RegistrationController.propTypes = {
  dispatch: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    errorMessage: state.users.error
  };
};

export default connect(mapStateToProps)(RegistrationController);
