import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {Link} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import UserService from '../services/UserService';

class RegisterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            passwordConfirmation: '',
            message: '',
        };

        this.register = this.register.bind(this);
        this.sendLogin = this.sendLogin.bind(this);
    }

    validateRegistrationInfo(username, email, password, passwordConfirmation) {
        let errorMessage = "";
        if (!/^[a-z0-9]{4,}$/i.test(username)) {
            errorMessage += 'Invalid username\n';
        }
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            errorMessage += 'Invalid email format\n';
        }
        if (!password || password.length<8) {
            errorMessage += 'Invalid password\n';
        }
        if (password !== passwordConfirmation) {
            errorMessage += 'Passwords don\'t match';
        }
        return errorMessage;
    }

    register = (e) => {
        e.preventDefault();

        const {
            username, email, password, passwordConfirmation,
        } = this.state;
        const userDetails = {
            username,
            email,
            password,
        };
        userDetails.password_confirmation = passwordConfirmation;
        const errorMesage = this.validateRegistrationInfo(username, email, password, passwordConfirmation);
        if (errorMesage) {
            this.setState({message: errorMesage});
            return;
        }
        UserService.register(userDetails)
            .then(() => {
                const email = userDetails.email;
                const password = userDetails.password;
                UserService.login({email, password})
                    .then((response) => {
                        localStorage.setItem('access_token', response.data.access_token);
                        window.location.replace('http://localhost:3000/');
                    })
                    .catch((error) => {
                        this.setState({message: error.response.data.errors});
                    });
            })
            .catch((error) => {
                this.setState({
                    message: error.response.data.errors,
                });
            });
    }

    sendLogin() {

    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value, message: ''});
    }

    render() {
        const {
            message, username, email, password, passwordConfirmation,
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
                    <Typography variant="h4" style={styles.center}>Register</Typography>
                    <form>
                        {message ? message.split('\n').map((msg) => <Typography variant="h6" style={styles.notification}
                                                                                key={msg}>{msg}</Typography>) : null}
                        <TextField type="text" label="Username (>4 characters)" fullWidth margin="normal"
                                   name="username" value={username} onChange={this.onChange}/>
                        <TextField type="text" label="Email" fullWidth margin="normal" name="email" value={email}
                                   onChange={this.onChange}/>
                        <TextField type="password" label="Password (>7 characters)" fullWidth margin="normal"
                                   name="password" value={password} onChange={this.onChange}/>
                        <TextField type="password" label="Password confirmation (>7 characters)" fullWidth
                                   margin="normal" name="passwordConfirmation" value={passwordConfirmation}
                                   onChange={this.onChange}/>
                        <Button variant="contained" color="secondary" onClick={this.register}>Register</Button>
                        <Link to='/login'>
                          <Button 
                            variant="contained" 
                            color="primary"
                            style={{float: 'right'}}
                          >
                            Already registered?
                          </Button>
                        </Link>
                    </form>
                </Container>
            </>
        );
    }
}

export default RegisterComponent;
