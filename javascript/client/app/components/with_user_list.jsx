import React from 'react';
import AuthedComponent from './authed_component';
import {UserController} from '../controllers';

export default function withUserList(Component) {
  class WithUserList extends React.Component {

    render() {
        return (
          <div className="row">
            <div className="col-xs-12 col-md-9">
              <Component {...this.props} />
            </div>
            <div className="col-xs-12 col-md-3">
              <AuthedComponent validRoles={['manager', 'admin']}>
                <UserController />
              </AuthedComponent>
            </div>
          </div>
        );
    }
  }

  return WithUserList;
}
