import React from 'react';
import axios from 'axios';

export default class SignupBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            usernname: '',
            password: '',
            errors: [],
            pwdState: null,
            userAlreadyExist: false,
            btnDisabled: false
        }        
    }

    showValidationErr = (elm,msg) => {
        this.setState((prevState) => ({errors: [...prevState.errors,{elm,msg}]}));
    }

    clearValidationErr = (elm) => {
        this.setState((prevState) => {
            const newArr = [];
            for(let err of prevState.errors) {
                if(elm !== err.elm) {
                    newArr.push(err);
                }
            }            
            return {errors: newArr};
        });        
    }

    onUsernameChange = (e) => {
        if (this.state.userAlreadyExist) {
            this.setState({userAlreadyExist: false});
        }
        this.setState({usernname: e.target.value});     
        this.clearValidationErr('username');   
    }

    onPasswordChange = (e) => {
        if (this.state.userAlreadyExist) {
            this.setState({userAlreadyExist: false});
        }
        this.setState({password: e.target.value});
        this.clearValidationErr('password');

        this.setState({pwdState: 'weak'});
        if (e.target.value.length > 4) {
            this.setState({pwdState: 'medium'});
        }
        if (e.target.value.length > 8) {
            this.setState({pwdState: 'strong'});
        }
    }

    submitSignup = (e) => {
        if (this.state.usernname === '') {
            this.showValidationErr('username',`username can't be empty`);            
        }
        if (this.state.password === '') {
            this.showValidationErr('password', `password can't be empty`);
        }

        //create user by calling backend /user api - XMLHttpRequest instance 
        const config = {                      
            timeout: 10000 
        };
        const reqBody = {
            username: this.state.usernname,
            password: this.state.password
        }
        axios.post('https://localhost/ump/user',reqBody,config).then(response => {
            //enable the previously disabled submit button
            this.setState({btnDisabled: false});

            if (response.status === 201) {
                //navigate to provider component
                this.props.setSignUp(true,this.state.usernname);
            }      
            else if (response.status === 200) {
                //render red message "User already exist"
                this.setState({userAlreadyExist: true});
            }
            else {
                console.log(`Unexpected response with status:${response.status}, statusText:${response.statusText}, data:${response.data}`);
                alert('Something unexpected happened mostly in server side, check server logs for more details');
            }
        }).catch(error => {
            //enable the previously disabled submit button
            this.setState({btnDisabled: false});

            console.log(`Looks like Client-Server communication error:${error}`); 
            alert('Something unexpected happened between client-server communication, check client/server logs for more details');
        });        
        
        //disable signup button to prevent multiple signup calls while one signup event in progress...
        this.setState({btnDisabled: true});
    }

    render() {
        let usernameErr = null, passwordErr = null;
        for (let err of this.state.errors) {
            if (err.elm === 'username') {
                usernameErr = err.msg;
            } 
            else if (err.elm === 'password') {
                passwordErr = err.msg;
            }
        }

        let pwdWeak = false, pwdMedium = false, pwdStrong = false;
        if(this.state.pwdState === 'weak') {
            pwdWeak = true;
        }
        else if (this.state.pwdState === 'medium') {
            pwdWeak = true;
            pwdMedium = true;
        }
        else if (this.state.pwdState === 'strong') {
            pwdWeak = true;
            pwdMedium = true;
            pwdStrong = true;
        }

        return (
            <div className="inner-container">
                <div className="header">
                    Signup
                </div>
                <div className="box">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" className="login-input" placeholder="Username"
                             onChange={this.onUsernameChange.bind(this)}/>  
                         <small className="danger-error">{usernameErr ? usernameErr : ""}</small>                          
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" className="login-input" placeholder="Password"
                             onChange={this.onPasswordChange.bind(this)}/>                        
                        <small className="danger-error">{passwordErr ? passwordErr : ""}</small>    
                        { this.state.password &&  
                            <div className="password-state">
                                <div className={"pwd pwd-weak " + (pwdWeak ? "show" : "")}></div>
                                <div className={"pwd pwd-medium " + (pwdMedium ? "show": "")}></div>
                                <div className={"pwd pwd-strong "+ (pwdStrong ? "show": "")}></div>
                            </div>
                        }
                    </div>
                    { this.state.userAlreadyExist && 
                        <small className="danger-error">User already exist</small>
                    }
                    <button type="button" className="login-btn" disabled={this.state.btnDisabled} onClick={this.submitSignup.bind(this)}>Signup</button>
                </div>                
            </div>
        )
    }
}