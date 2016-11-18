import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

export default function authRoute(Component) {
  class AuthedRoute extends React.Component {
    componentDidMount() {
      this._checkAndRedirect();
    }

    componentDidUpdate() {
      this._checkAndRedirect();
    }

    _checkAndRedirect() {
      const { dispatch } = this.props;

      if (!this.props.token) {
        dispatch(push('/login'));
      }
    }

    render() {
      return this.props.token &&
        <Component {...this.props} />;
    }
  }

  AuthedRoute.propTypes = {
    token: PropTypes.string,
    dispatch: PropTypes.func.isRequired
  };

  const mapStateToProps = (state) => {
    return {
      token: state.auth.token
    };
  };

  return connect(mapStateToProps)(AuthedRoute);
}
