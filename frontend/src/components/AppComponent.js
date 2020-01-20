import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import UserService from '../services/UserService';
import LoginComponent from './LoginComponent';
import Dashboard from './Dashboard';
import RegisterComponent from './RegisterComponent';

export default class AppComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      mainComponent: null
    };
  }

  componentDidMount() {
    console.log("componentdidmount");
    UserService.isLoggedIn()
      .then((response) => {
        console.log(response);
        console.log(response.status);
        if (response) {
          this.setState({mainComponent: <Dashboard/>})
        }
        else {
          this.setState({mainComponent: <LoginComponent/>})
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        this.setState({mainComponent: <LoginComponent/>});
      })
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/register">
            <RegisterComponent/>
          </Route>
          <Route path="/">
            {this.state.mainComponent}
          </Route>
        </Switch>
      </Router>
    );
  }
}

