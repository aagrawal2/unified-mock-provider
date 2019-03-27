import React from 'react';
import { Form, Header, Button } from 'semantic-ui-react';
import Axios from 'axios';
import AccountDetails from '../conf/provider-accounts.json';
import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';

export default class Account extends React.Component {    
    
    constructor(props) {
        super(props);
        this.state = {
            formData: []
        };
        this.accountId = this.props.match.params.accountId;
        this.username = this.props.username;
        this.providerName = this.props.providerName;    
        this.navigateBack = this.navigateBack.bind(this);
    };

    componentDidMount = () => {        
        //call /account/${accountId} api to get details about the account
        const url = 'https://localhost/ump/user/'+this.username+'/provider/'+this.providerName+'/account/'+this.accountId;
        const config = {timeout:10000};
        
        Axios.get(url,config)
            .then(response=>{
                if(response.status === 200 && !response.data.error) {
                    //construct label & values for Form to render
                    //console.log(`account response=`+JSON.stringify(response.data[0],null,2));
                    this.constructFormData(response.data[0]);                    
                }
            })
            .catch(error=>{
                console.log(`client side error:${error.stack}`);
                alert('Something unexpected between client server communication or rendering Account component, check error logs for more details');
            });
    }

    navigateBack = () => {
        //this.props.navigateBack();
        this.props.history.push('/provider/accounts');
    }

    getLogo = () => {
        switch (this.providerName) {
            case 'bofa': 
                return BofaLogo;
            case 'citi':
                return CitiLogo;
            case 'amex': 
                return AmexLogo;
            case 'fcu': 
                return FirstTechLogo;
            case 'wf': 
                return WellsFargoLogo;
            case 'comcast':
                return ComcastLogo;
            default:
                return;
        }
    }

    constructFormData = (accountData) => {
        const formData = [];
        //Find if any of accountTypeFields exist in accountData object
        let KEY_ACCOUNT_TYPE_FOUND = false;
        let accountTypeValue;
        for(let field of AccountDetails.accountTypeFields) {
            const accountDataKeys = Object.keys(accountData);
            for(let key of accountDataKeys) {
                if(key.toLowerCase() === field.toLowerCase()) {
                    KEY_ACCOUNT_TYPE_FOUND = true;                    
                    accountTypeValue = accountData[key];
                    break;
                }
            }
            if(KEY_ACCOUNT_TYPE_FOUND) {
                break; 
            }
        }
        if(!KEY_ACCOUNT_TYPE_FOUND) {
            alert("Field for AccountType value is not found in our system, please contact admin to add this in the system");
            return;
        }

        //Map accountData field names with Labels from config file
        this.accountType = accountTypeValue.toLowerCase();
        const accountDetailsConfig = AccountDetails[this.providerName.toLowerCase()][this.accountType];        
        accountDetailsConfig.forEach(element=>{
            const label = element.label;
            let value;
            if(element.field.includes('.')) {
                const keys = element.field.split('.');
                //skip processing of field in case not found in account object
                if(!accountData.hasOwnProperty(keys[0])) {
                    return;
                }
                value = accountData[keys[0]];
                for(let i=1; i<keys.length; i++) {
                    value = value[keys[i]];
                }
            }
            else {
                //skip processing of field in case not found in account object
                if(!accountData.hasOwnProperty(element.field)) {
                    return;
                }
                value = accountData[element.field];
            }
            formData.push({label:label,value:value});                        
        });        
        this.setState({formData});        
    }

    groupFormData = (formData,index,groupSize) => {
        const groupInputs = [];
        
        for(let i=0; i<groupSize; i++) {
            let key = Math.random().toString(36).substr(2);            
            let label = formData[index+i].label;            
            let placeholder = formData[index+i].value;
            groupInputs.push(<Form.Input key={key} label={label} placeholder={placeholder}/>);
        }        
        return groupInputs;
    }

    loadFormGroups = () => {
        const formGroups = [];        
        const {formData} = this.state;
        if(!this.providerName) {
            return;
        }
        const FORM_GROUP_SIZE = AccountDetails[this.providerName].form_group_size;
        let index = 0;        
        let lengthFormData = formData.length;        
        while(lengthFormData - FORM_GROUP_SIZE > 0) {
            lengthFormData = lengthFormData - FORM_GROUP_SIZE;
            let key = Math.random().toString(36).substr(2);                        
            let formGroup = <Form.Group key={key} widths="equal">{this.groupFormData(formData,index,FORM_GROUP_SIZE)}</Form.Group>;
            formGroups.push(formGroup);                        
            index+=FORM_GROUP_SIZE;
        }
        if(lengthFormData > 0) {
            const key = Math.random().toString(36).substr(2);
            let formGroup = <Form.Group key={key} widths="equal">{this.groupFormData(formData,index,lengthFormData)}</Form.Group>;
            formGroups.push(formGroup);
        }
        
        return formGroups;
    }

    render() {        
        return(
            <div>
                <Button color="black" style={{float:"right"}} icon="arrow alternate circle left" onClick={this.navigateBack} />                
                <Header as="h1" image={this.getLogo()}/>
                <Form>                    
                    {this.loadFormGroups()}                
                    <Form.Button content="Save" icon="save" attached="bottom"/>
                </Form>                
            </div>
        )
    }
}