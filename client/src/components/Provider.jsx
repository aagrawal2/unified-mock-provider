import React from 'react';
/* import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown'; */
import {Dropdown, Button} from 'semantic-ui-react';
import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';

//import 'semantic-ui-css/semantic.min.css';
import '../scss/Provider.scss';

import provider from '../conf/provider.json';
import Axios from 'axios';

//TODO: convert this to functional component
export default class Provider extends React.Component {
    
    constructor (props) {
        super(props);
        this.state = {        
        };
        this.loadProviderLogos();        
    }

    loadProviderLogos = () => {
        provider.names.forEach(provider=>{
            if (provider.value.toLowerCase().includes('bofa')) {
                provider.image = {avatar:true,src:BofaLogo};
            } 
            else if (provider.value.toLowerCase().includes('citi')) {
                provider.image = {avatar:true,src:CitiLogo};
            }
            else if (provider.value.toLowerCase().includes('amex')) {
                provider.image = {avatar:true,src:AmexLogo};
            }
            else if (provider.value.toLowerCase().includes('comcast')) {
                provider.image = {avatar:true,src:ComcastLogo};
            }
            else if (provider.value.toLowerCase().includes('fcu')) {
                provider.image = {avatar:true,src:FirstTechLogo};
            }
            else if (provider.value.toLowerCase().includes('wf')) {
                provider.image = {avatar:true,src:WellsFargoLogo};
            }
        })
    };
    
    navigateBack = () => this.props.navigateBack()

    onChangeProvider = (event, data) => {                
        const username = this.props.username;
        const providerName = data.value;
        //call backend api to find accounts for this username & provider
        const url = 'https://localhost/ump/user/'+username+'/provider/'+providerName+'/accounts';
        const config = {
            timeout: 10000
        };
        Axios.get(url,config).then(response=>{
            if(response.status === 200 && !response.data.error) {
                const accountData = response.data;
                //render Account component
                this.props.setRenderAccount(true,providerName,accountData);        
            }
        }).catch(error=>{
            console.log(`error=${error.stack}`);
            alert('Something unexpected between client server communication or rendering Accounts component, check error logs for more details');
        })

    }
    
    render() {             
        return (
            <div>
                <Button color="black" style={{float:"right"}} icon="arrow alternate circle left" onClick={this.navigateBack} />
                <div className="provider">
                    <Dropdown placeholder='Choose your provider' fluid search selection options={provider.names} 
                        onChange={this.onChangeProvider}/>
                </div>
            </div>
                            
        )
    }
}

//TODO: render Select provider 
//TODO: render Menu to have all options like Create Account with default values, etc...
//TODO:                         