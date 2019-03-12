import React from 'react';
/* import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown'; */
import {Dropdown} from 'semantic-ui-react';
import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';

//import 'semantic-ui-css/semantic.min.css';
import '../scss/Provider.scss';

import provider from '../conf/provider.json';

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
            if (provider.value.toLowerCase().includes('bank of america')) {
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
            else if (provider.value.toLowerCase().includes('first tech')) {
                provider.image = {avatar:true,src:FirstTechLogo};
            }
            else if (provider.value.toLowerCase().includes('wells fargo')) {
                provider.image = {avatar:true,src:WellsFargoLogo};
            }
        })
    };
    
    /* loadProviderNames = () => {
        const items = [];
        const providerNames = provider.names;
        let key = 0;
        providerNames.forEach(provider=>items.push(<Dropdown.Item key={key++} eventKey={provider}>{provider}</Dropdown.Item>))
        
        return items;
    } */

    onChangeProvider = (event, data) => {                
        const username = this.props.username;
        console.log(`username:${username} provider=${data.value}`);
        //TODO: call backend api to find accounts for this username & provider
        //render Account component
        this.props.setRenderAccount(true);
    }
    
    render() {             
        return (
            <div className="provider">
                <Dropdown placeholder='Choose your provider' fluid search selection options={provider.names} 
                    onChange={this.onChangeProvider}/>
            </div>                
        )
    }
}

//TODO: render Select provider 
//TODO: render Menu to have all options like Create Account with default values, etc...
//TODO:                         