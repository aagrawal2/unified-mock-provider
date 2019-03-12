import React from 'react';
import Axios from 'axios';

export default class SigninBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            error: ''
        }
    };

    onChangeUsername = (e) => {
        if (this.state.error) {
            this.setState({error: ''});
        }
        this.setState({username: e.target.value});
    };

    onChangePassword = (e) => {
        if (this.state.error) {
            this.setState({error: ''});
        }
        this.setState({password: e.target.value});
    };

    submitLogin = (e) => {
        const username = this.state.username;
        const password = this.state.password;

        //call backend /user api to signin 
        const config = {
            baseURL: 'https://localhost/ump',
            url: '/user/?username='+username+'&password='+password,
            method: 'get',
            timeout: 10000
        };
        Axios(config).then(response => {
            if (response.status === 200 && ! response.data.error) {
                //navigate to provider component   
                this.props.setSignIn(true,username);           
            }
            else if (response.status === 200) {
                //render error message in red
                this.setState({error: response.data.error});
            }
            else {
                console.log(`response status:${response.status} statusText:${response.statusText} data=${response.data}`);
                alert('Something unexpected happened mostly on server side, check server logs for more details');
            }
        }).catch(error => {
            console.log(`error=${error}`);
            alert('Something unexpected happened between Client-Server communication, check server logs for more details');
        })
    };

    render() {
        return (
            <div className="inner-container">
                <div className="header">
                    Signin
                </div>
                <div className="box">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" className="login-input" placeholder="Username" 
                            onChange={this.onChangeUsername}/>                                                
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" className="login-input" placeholder="Password"
                            onChange={this.onChangePassword}/>                        
                    </div>
                    { this.state.error &&
                        <div>
                            <small className="danger-error">{this.state.error}</small>
                        </div>
                    }                    
                    <button type="button" className="login-btn" onClick={this.submitLogin.bind(this)}>Signin</button>
                </div>
            </div>
        )
    }
}