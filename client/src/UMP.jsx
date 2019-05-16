import React, {Component, Fragment} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import Redirect from 'react-router-dom/Redirect';
import Switch from 'react-router-dom/Switch';
import _ from 'lodash';
import SigninBox from './components/SigninBox';
import SignupBox from './components/SignupBox';
import Provider from './components/Provider';
import Transactions from './components/Transactions';

import 'semantic-ui-css/semantic.min.css';
import './scss/_loginSty.scss';
import Accounts from './components/Accounts';
import Account from './components/Account';
import { Grid, Image, Header } from 'semantic-ui-react';
//import './scss/bootstrap.min.scss';

import BofaLogo from './images/bofa.jpg';
import CitiLogo from './images/citi.jpg';
import AmexLogo from './images/amex.jpg';
import ComcastLogo from './images/comcast.jpg';
import FirstTechLogo from './images/firsttech.jpg';
import WellsFargoLogo from './images/wellsfargo.jpg';
import PgeLogo from './images/pge.jpg';
import ChaseLogo from './images/chase.jpg';
import UsBankLogo from './images/usbank.png';
import PncLogo from './images/pnc.png';
import CapOneLogo from './images/capitalone.png';

export default class UMP extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isSigninOpen: true,
            isSignupOpen: false,
            isSignIn: false,
            isSignUp: false, 
            renderProvider:false,                                  
            renderAccounts: false,
            renderAccount: false,
            renderTransactions: false
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
        this.setState({isSignIn: flag, renderProvider: flag});        
    }    

    setSignUp = (flag,username) => {
        this.username = username;
        this.setState({isSignUp: flag, renderProvider: flag});
    }

    setRenderProivder = (flag,providerName) => {
        this.providerName = providerName;
        this.setState({renderProvider: flag});
    }

    setRenderAccounts = (flag,providerName) => {
        this.providerName = providerName;        
        this.setState({renderAccounts: flag})                        
    }

    setRenderAccount = (flag) => {
        this.setState({renderAccount:flag});
    }

    setRenderTransactions = (flag,accountId,accountType) => {
        this.accountId = accountId;
        this.accountType = accountType;
        this.setState({renderTransactions: flag});
    }    

    logosInGrid = _.times(12, i => {
            switch(i) {
                case 1: 
                    return <Grid.Column key={i}>
                        <Image src={BofaLogo} />
                    </Grid.Column>;
                case 2: 
                    return <Grid.Column key={i}>
                        <Image src={CitiLogo} />
                    </Grid.Column>;
                case 3: 
                    return <Grid.Column key={i}>
                        <Image src={AmexLogo} />
                    </Grid.Column>;        
                case 4: 
                    return <Grid.Column key={i}>
                        <Image src={ComcastLogo} />
                    </Grid.Column>; 
                case 5: 
                    return <Grid.Column key={i}>
                        <Image src={PgeLogo} />
                    </Grid.Column>;
                case 6: 
                    return <Grid.Column key={i}>
                        <Image src={FirstTechLogo} />
                    </Grid.Column>;    
                case 7: 
                    return <Grid.Column key={i}>
                        <Image src={WellsFargoLogo} />
                    </Grid.Column>;                    
                case 8: 
                    return <Grid.Column key={i}>
                        <Image src={CapOneLogo} />
                    </Grid.Column>;
                case 9: 
                    return <Grid.Column key={i}>
                        <Image src={ChaseLogo} />
                    </Grid.Column>;
                case 10: 
                    return <Grid.Column key={i}>
                        <Image src={PncLogo} />
                    </Grid.Column>;    
                case 11: 
                    return <Grid.Column key={i}>
                        <Image src={UsBankLogo} />
                    </Grid.Column>;    
                default:
                    return '';
            }
        });

    signUpSignInBox = () => {
        return (
            <div>
                <Grid textAlign="center" style={{marginTop:"20px"}}>{this.logosInGrid}</Grid>
                <Header as="h2" textAlign="center" style={{marginBottom:"50px"}}>
                    <Header.Content>
                        Cherry 
                        <Header.Subheader>Cultivation of FI/Non-FI data</Header.Subheader>
                    </Header.Content>
                </Header>
                <div className="root-container">                    
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
            </div>                    
        );
    }

    logout = () => {
        this.setState({isSignIn:false,isSignUp:false});
    }

    render() {       
        const { isSignIn, isSignUp, renderProvider, renderAccounts, renderAccount, renderTransactions } = this.state;
        return (  
            <BrowserRouter> 
                <Fragment>  
                    {
                      ( (!isSignIn && !isSignUp) && <Redirect to="/login" /> )
                    
                    ||
                        (((isSignIn || isSignUp) && renderTransactions) && <Redirect to="/provider/account/transactions" />)
                    
                    ||
                        (((isSignIn || isSignUp) && renderAccount) && <Redirect to={"/provider/account/"+this.accountId} />)
                    || 
                        (((isSignIn || isSignUp) && renderProvider) && <Redirect to="/provider"/> )                       
                     
                    ||
                        (((isSignIn || isSignUp) && renderAccounts) && <Redirect to="/provider/accounts"/> )                       
                    }
                    <Switch>
                        <Route exact path="/" render={()=><Redirect to="/login" />} />
                        <Route exact path="/login" render={this.signUpSignInBox} />            
                        {(isSignIn || isSignUp) && <Route exact path="/provider" render={props => <Provider {...props} username={this.username} 
                            setRenderAccounts={this.setRenderAccounts} setRenderProvider={this.setRenderProivder}
                            navigateBack={this.logout}/>} />}                        
                        {(isSignIn || isSignUp) && <Route exact path="/provider/accounts" render={props => <Accounts {...props} providerName={this.providerName} username={this.username}
                            logout={this.logout} setRenderAccounts={this.setRenderAccounts} navigateBack={()=>this.setState({renderAccounts:false,renderProvider:true})} />} />}
                        {(isSignIn || isSignUp) && <Route exact path="/provider/account/transactions" 
                            render={props => <Transactions {...props} providerName={this.providerName} username={this.username}
                            accountId={this.accountId} accountType={this.accountType} 
                            navigateBack={()=>this.setState({renderTransactions:false,renderAccount:true})} logout={this.logout} />} />}    
                        {(isSignIn || isSignUp) && <Route exact path="/provider/account/:accountId" render={ props => <Account {...props} providerName={this.providerName} username={this.username} 
                            navigateBack={()=>this.setState({renderAccount:false,renderAccounts:true})} setRenderAccounts={this.setRenderAccounts} 
                            setRenderTransactions={this.setRenderTransactions} logout={this.logout}/>}/> }                       
                            
                        <Route render={()=><center><h5>You are not signed in or Page Not Found</h5></center>}/>
                    </Switch>                    
                </Fragment>                          
            </BrowserRouter>  
        )
    }
}