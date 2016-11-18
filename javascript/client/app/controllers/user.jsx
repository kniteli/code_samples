import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import rest_client from '../rest_client';
import UserList from '../components/user_list';
import UserForm from '../components/user_form';
import {activeUserChanged} from '../actions';
import _ from 'lodash';

class UserController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {formHidden: true};
  }

  componentDidMount() {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.users());
  }

  render() {
    return (
      <div>
        <div className="row">
          <button className="btn btn-primary" onClick={e => this.toggleForm(e)}>Create User</button>
          {!this.state.formHidden &&
          <UserForm errorMessage={this.props.errorMessage} onSave={user => this.onCreate(user)} />}
        </div>
        <div className="row">
          <UserList
            activeUser={this.props.activeUser}
            users={_.values(this.props.users)}
            errorMessage={this.props.errorMessage}
            onEdit={user => this.onEdit(user)}
            onDelete={user => this.onDelete(user)}
            onUserSelected={user => this.onUserSelected(user)} />
        </div>
      </div>
    );
  }

  onUserSelected(user) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.userItineraries({id: user.id}));
    dispatch(activeUserChanged(user));
  }

  toggleForm(e) {
    this.setState({formHidden: !this.state.formHidden});
  }

  onEdit(user) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.updateUser.send(user));
  }

  onDelete(user) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.deleteUser.send(user));
  }

  onCreate(user) {
    let {dispatch} = this.props;
    dispatch(rest_client.actions.createUser.send(user)).then(result => {
      this.setState({formHidden: true});
    }).catch(reason => console.log(reason));
  }
}

UserController.propTypes = {
  dispatch: PropTypes.func.isRequired,
  activeUser: PropTypes.object,
  users: PropTypes.object,
  errorMessage: PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    users: state.users.by_id,
    activeUser: state.users.by_id[state.users.active_user],
    errorMessage: state.users.error
  };
};

export default connect(mapStateToProps)(UserController);
