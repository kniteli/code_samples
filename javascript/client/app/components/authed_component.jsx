import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

class AuthedComponent extends React.Component {
  render() {
    return (this.props.validRoles.indexOf(this.props.user.role) !== -1) && this.props.children;
  }
}

AuthedComponent.propTypes = {
  token: PropTypes.string,
  user: PropTypes.object,
  validRoles: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    user: state.auth.user
  };
};

export default connect(mapStateToProps)(AuthedComponent);
