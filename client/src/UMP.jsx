import React, {Component, Fragment} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import Redirect from 'react-router-dom/Redirect';
import Switch from 'react-router-dom/Switch';
import SigninBox from './components/SigninBox';
import SignupBox from './components/SignupBox';
import Provider from './components/Provider';

import 'semantic-ui-css/semantic.min.css';
import './scss/_loginSty.scss';
import Account from './components/Account';
//import './scss/bootstrap.min.scss';


export default class UMP extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isSigninOpen: true,
            isSignupOpen: false,
            isSignIn: false,
            isSignUp: false,                                   
            renderAccount: false
        }                
    }

    showSigninBox = () => {
        this.setState({isSigninOpen: true, isSignupOpen: false})
    }

    showSignupBox = () => {
        this.setState({isSigninOpen: false, isSignupOpen: true})
    }    

    setSignIn = (flag,username) => {
        this.username = username;
        this.setState({isSignIn: flag});        
    }    

    setSignUp = (flag,username) => {
        this.username = username;
        this.setState({isSignUp: flag});
    }

    setRenderAccount = (flag,providerName,accountData) => {
        this.providerName = providerName;
        this.accountData = accountData;
        this.setState({renderAccount: flag})                        
    }

    logOut = () => this.setState({isSignIn:false,isSignUp:false})

    signUpSignInBox = () => {
        return (
            <div className="root-container">
                    <div className="header title-header">Welcome to Unified Mock Provider</div>
                    <div className="box-controller">
                        <div className={"controller" + (this.state.isSigninOpen ? " selected-controller" : "")}
                            onClick={this.showSigninBox.bind(this)}>
                            Signin
                                </div>
                        <div className={"controller" + (this.state.isSignupOpen ? " selected-controller" : "")}
                            onClick={this.showSignupBox.bind(this)}>
                            Signup
                                </div>
                    </div>
                    <div className="box-container">
                        {this.state.isSigninOpen && <SigninBox setSignIn={this.setSignIn} />}
                        {this.state.isSignupOpen && <SignupBox setSignUp={this.setSignUp} />}
                    </div>
            </div>                    
        );
    }

    render() {       
        const { isSignIn, isSignUp, renderAccount } = this.state;
        return (  
            <BrowserRouter> 
                <Fragment>  
                    {
                        (!isSignIn && !isSignUp) && <Redirect to="/login" />
                    }
                    { 
                        ((isSignIn || isSignUp) && !renderAccount) && <Redirect to="/provider"/>                        
                    } 
                    {
                        ((isSignIn || isSignUp) && renderAccount) && <Redirect to="/provider/account"/>                        
                    }
                    <Switch>                        
                        <Route exact path="/" render={()=><Redirect to="/login" />} />
                        <Route path="/login" render={this.signUpSignInBox} />            
                        {(isSignIn || isSignUp) && <Route exact path="/provider" render={props => <Provider {...props} username={this.username} 
                            setRenderAccount={this.setRenderAccount} navigateBack={this.logOut}/>} />}                        
                        {(isSignIn || isSignUp) && <Route path="/provider/account" render={props => <Account {...props} providerName={this.providerName} accountData={this.accountData}
                            navigateBack={()=>this.setRenderAccount(false)} />} />}
                        <Route render={()=><center><h5>You are not signed in or Page Not Found</h5></center>}/>
                    </Switch>                    
                </Fragment>                          
            </BrowserRouter>  
        )
    }
}