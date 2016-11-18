import React, {PropTypes} from 'react';
import UserForm from './user_form';

export default class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {form_views: {}};
  }
  render() {
    let list = this.props.users.map(user => {
      var class_name = 'list-group-item';
      class_name += (this.props.activeUser && user.id === this.props.activeUser.id)?' selected':'';
      return (
        <li className={class_name} onClick={e => this.userSelected(e, user)} key={user.id}>
          <ul className="list-inline">
            <li><strong>Username:</strong> {user.email}</li>
            <li>
              <button className="btn btn-secondary" onClick={e => {e.stopPropagation(); this.toggleForm(user.id);}}>Edit</button>
              <button className="btn btn-secondary" onClick={e => {e.stopPropagation(); this.props.onDelete(user);}}>Delete</button>
            </li>
          </ul>
          {this.state.form_views[user.id] &&
          <UserForm errorMessage={this.props.errorMessage} onSave={user => this.saveEdit(user)} user={user} />
          }
        </li>
      );
    });
    return <ul className="list-group">{list}</ul>
  }

  userSelected(e, user) {
    e.preventDefault();
    this.props.onUserSelected(user);
  }

  saveEdit(user) {
    this.toggleForm(user.id);
    this.props.onEdit(user);
  }

  toggleForm(id) {
    this.setState({
      form_views: {
        ...this.state.form_views,
        [id]: !this.state.form_views[id]
      }
    });
    return false;
  }
}

UserList.propTypes = {
  users: PropTypes.array.isRequired,
  activeUser: PropTypes.object,
  onUserSelected: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}
