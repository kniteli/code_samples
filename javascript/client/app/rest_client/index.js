import reduxApi from 'redux-api';
import fetch from "isomorphic-fetch";
import adapterFetch from "redux-api/lib/adapters/fetch";
import _ from 'lodash';
import {receiveLogin} from '../actions';

const root_url = "http://localhost:3030";

export default reduxApi({
  login: {
    url: "/auth/local",
    options: function() {
      return {
        method: "POST"
      };
    },
    transformer(data) {
      if (data) {
        let { token } = data;
        let user = data.data;
        return { token, user };
      }
      return { token: "", user: {} };
    },
    postfetch: [({data, actions, dispatch, getState, request}) => {
      if(!_.isEmpty(data.user)) {
        dispatch(receiveLogin(data.user));
      }
    }]
  },
  users: {
    url: '/users',
    reducerName: 'users',
    transformer: multiTransformer
  },
  createUser: {
    url: '/users',
    reducerName: 'users',
    options: {method: 'POST'},
    helpers: {
      send(user) {
        return [null, {body: JSON.stringify(user)}];
      }
    },
    transformer: singleTransformer
  },
  updateUser: {
    url: '/users/:id',
    reducerName: 'users',
    options: {method: 'PATCH'},
    helpers: {
      send(user) {
        return [{id: user.id}, {body: JSON.stringify(user)}];
      }
    },
    transformer: singleTransformer
  },
  deleteUser: {
    url: '/users/:id',
    reducerName: 'users',
    options: {method: 'DELETE'},
    helpers: {
      send(user) {
        return [{id: user.id}, {}];
      }
    },
    transformer: (response) => {
      if(response) {
        return {new: {}, deleted: {[response.id]: response}};
      }

      return {new: {}, deleted: {}};
    }
  },
  itinerary: {
    url: '/itineraries/:id',
    reducerName: 'itineraries',
    transformer: singleTransformer
  },
  itineraries: {
    url: '/itineraries',
    reducerName: 'itineraries',
    transformer: multiTransformer
  },
  updateItinerary: {
    url: '/itineraries/:id',
    reducerName: 'itineraries',
    options: {method: 'PATCH'},
    helpers: {
      send(itinerary) {
        return [{id: itinerary.id}, {body: JSON.stringify(itinerary)}];
      }
    },
    transformer: singleTransformer
  },
  deleteItinerary: {
    url: '/itineraries/:id',
    reducerName: 'itineraries',
    options: {method: 'DELETE'},
    helpers: {
      send(itinerary) {
        return [{id: itinerary.id}, {}];
      }
    },
    transformer: (response) => {
      if(response) {
        return {new: {}, deleted: {[response.id]: response}};
      }

      return {new: {}, deleted: {}};
    }
  },
  createItinerary: {
    url: '/itineraries',
    reducerName: 'itineraries',
    options: {
      method: "POST"
    },
    helpers: {
      send(itinerary) {
        return [null, {body: JSON.stringify(itinerary)}];
      }
    },
    transformer: singleTransformer
  },
  createUserItinerary: {
    url: '/users/:id/itineraries',
    reducerName: 'itineraries',
    options: {method: 'POST'},
    helpers: {
      send(id, itinerary) {
        return [{id: id}, {body: JSON.stringify(itinerary)}];
      }
    },
    transformer: singleTransformer
  },
  userItineraries: {
    url: '/users/:id/itineraries',
    reducerName: 'itineraries',
    transformer: multiTransformer
  }
}).use("options", (url, params, getState)=> {
  const { auth: { token }} = getState();
  // Add token to header request
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    return { headers: {  ...headers, Authorization: `Bearer ${token}` } };
  }
  return { headers };
}).use("fetch", adapterFetch(fetch))
  .use("rootUrl", root_url);

function singleTransformer(response) {
  if(response) {
    return {new: {[response.id]: response}, deleted: {}};
  }
  return {new: {}, deleted: {}};
}

function multiTransformer(response) {
  if(response) {
    //map response array to { id: value } so that we can store itineraries.by_id
    return {new: _.zipObject( _.map(response.data, it => it.id), response.data ), deleted:{}};
  }
  return {new: {}, deleted: {}};
}
