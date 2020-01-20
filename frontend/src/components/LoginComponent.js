import React from 'react';
import {Link} from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import UserService from '../services/UserService';

class LoginComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            message: '',
        };

        this.login = this.login.bind(this);
    }

    validateCredentials(email, password) {
        let errorMessage = "";
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            errorMessage += 'Invalid email format.';
        }
        if (!password) {
            errorMessage += 'Empty password';
        }
        return errorMessage;
    }

    login = (e) => {
        e.preventDefault();
        const {email, password} = this.state;
        const credentials = {email, password};
        const errorMessage = this.validateCredentials(email, password);
        if (errorMessage) {
            this.setState({message: errorMessage});
            return;
        }
        UserService.login(credentials)
            .then((response) => {
                localStorage.setItem('access_token', response.data.access_token);
                window.location.reload(false);
            })
            .catch((error) => {
                this.setState({
                    message: error.response.data.description,
                });
            });
    };

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

    render() {
        const {
            email, password, message,
        } = this.state;

        const styles = {
            center: {
                display: 'flex',
                justifyContent: 'center',
            },
            notification: {
                display: 'flex',
                color: '#dc3545',
            },
        };

        return (
            <>
                <Container maxWidth="sm">
                    <Typography variant="h4" style={styles.center}>Login</Typography>
                    <form>
                        {message.split('.').map((msg) => <Typography variant="h6" style={styles.notification}
                                                                     key={msg}>{msg}</Typography>)}
                        <TextField type="text" label="EMAIL" fullWidth margin="normal" name="email" value={email}
                                   onChange={this.onChange}/>
                        <TextField type="password" label="PASSWORD" fullWidth margin="normal" name="password"
                                   value={password} onChange={this.onChange}/>
                        <Button variant="contained" color="secondary" onClick={this.login}>Login</Button>
                        <Link to='/register'>
                          <Button 
                            variant="contained" 
                            color="primary"
                            style={{float: 'right'}}
                          >
                            Not a user yet?
                          </Button>
                        </Link>
                    </form>
                </Container>
            </>
        );
    }
}

export default LoginComponent;
