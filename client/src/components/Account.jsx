import React from 'react';
import { Form, Header, Button, Transition, Message, Menu } from 'semantic-ui-react';
import Axios from 'axios';
import AccountDetails from '../conf/provider-details.json';
import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';
import '../scss/Account.scss';
import Backend from '../conf/backend.json';

export default class Account extends React.Component {    
    
    constructor(props) {
        super(props);
        this.state = {
            formData: [],
            visible: false,
            success: false,
            error: false,
            message: '',
            icon: '',
            activeItem: 'Show Transactions'             
        };
        this.accountId = this.props.match.params.accountId;
        this.username = this.props.username;
        this.providerName = this.props.providerName;     
        this.accountDetailsConfig = undefined;       
        this.navigateBack = this.navigateBack.bind(this);        
    };

    componentDidMount = () => {        
        //call /account/${accountId} api to get details about the account
        const url = Backend.baseURL+'/user/'+this.username+'/provider/'+this.providerName+'/account/'+this.accountId;
        const config = {
            timeout: Backend.timeout
        }        

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
        this.props.navigateBack();
        //this.props.history.push('/provider/accounts');
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
        this.accountDetailsConfig = AccountDetails[this.providerName.toLowerCase()].accounts[this.accountType];        
        this.accountDetailsConfig.forEach(element=>{
            const label = element.label;
            let placeholder;
            if(element.field.includes('.')) {
                const keys = element.field.split('.');
                //skip processing of field in case not found in account object
                if(!accountData.hasOwnProperty(keys[0])) {
                    return;
                }
                placeholder = accountData[keys[0]];
                for(let i=1; i<keys.length; i++) {
                    placeholder = placeholder[keys[i]];
                }
            }
            else {
                //skip processing of field in case not found in account object
                if(!accountData.hasOwnProperty(element.field)) {
                    return;
                }
                placeholder = accountData[element.field];
            }
            formData.push({label:label,placeholder:placeholder,value:''});                                   
        });        
        this.setState({formData});        
    }

    groupFormData = (formData,index,groupSize) => {
        const groupInputs = [];
        let form_group_input_key = 0;        
        for(let i=0; i<groupSize; i++) {
            //const key = Math.random().toString(36).substr(2);            
            const label = formData[index+i].label;            
            const placeholder = formData[index+i].placeholder;
            const value = formData[index+i].value;            
            groupInputs.push(<Form.Input key={form_group_input_key++} label={label} name={label} placeholder={placeholder} value={value} onChange={this.changeHandlerFormValue}/>);            
        }  
        
        return groupInputs;
    }

    loadFormGroups = () => {
        const formGroups = [];        
        const {formData} = this.state;
        if(!this.providerName) {
            return;
        }
        const FORM_GROUP_SIZE = AccountDetails[this.providerName].accounts.form_group_size;
        let index = 0;        
        let lengthFormData = formData.length;        
        let form_group_key = 0;        
        while(lengthFormData - FORM_GROUP_SIZE > 0) {             
            lengthFormData = lengthFormData - FORM_GROUP_SIZE;
            //let key = Math.random().toString(36).substr(2);                        
            let formGroup = <Form.Group key={form_group_key++} widths="equal">{this.groupFormData(formData,index,FORM_GROUP_SIZE)}</Form.Group>;
            formGroups.push(formGroup);                        
            index+=FORM_GROUP_SIZE;            
        }
        if(lengthFormData > 0) {
            //const key = Math.random().toString(36).substr(2);
            let formGroup = <Form.Group key={form_group_key} widths="equal">{this.groupFormData(formData,index,lengthFormData)}</Form.Group>;
            formGroups.push(formGroup);
        }
        
        return formGroups;
    }

    changeHandlerFormValue = (event,data) => {        
        const formData = [...this.state.formData];
        formData.forEach(element=>{
            if(element.label === data.name) {
                element.value = data.value;
                return;
            }
        });
        this.setState({formData});        
    }

    clickHandlerFormSubmit = (event,data) => {        
        //incorporate original fields in the formData object before sending it to server 
        const formDataToSend = [...this.state.formData];
        formDataToSend.forEach(element=>{
            //find this element in this.accountDetailsConfig and then extract the accessor field from this config
            const configElement = this.accountDetailsConfig.find(configElement=>(element.label === configElement.label));
            element.field = configElement.field.trim();                    
        });

        //Transform formDataToSend to PUT reqBody object containing all the fields with updated values from user 
        const reqBody = {};
        formDataToSend.forEach(element=>{            
            //if element.field is a nested field then xform it to object 
            if(element.field.includes('.')) {
                const fields = element.field.split('.');
                const rootObj = {};
                let subObj = rootObj;
                let i = 1;
                for(;i<fields.length-1; i++) {
                    subObj[fields[i]] = {};
                    subObj = subObj[fields[i]];
                }
                //set value to the last nested field
                if(element.value === '') {
                    subObj[fields[i]] = element.placeholder;                    
                }   
                else {
                    subObj[fields[i]] = element.value;
                }
                reqBody[fields[0]] = rootObj;                
            }
            else {
                if(element.value === '') {
                    reqBody[element.field] = element.placeholder;
                }
                else {
                    reqBody[element.field] = element.value;
                }
            }                        
        });

        //TODO:render warning message if Date is not in UTC format 
        //call backend api PUT /account          
        const url = Backend.baseURL+'/user/'+this.username+'/provider/'+this.providerName+'/account/'+this.accountId;
        const config = {timeout:Backend.timeout};
        Axios.put(url,reqBody,config)
            .then(response=>{
                if(response.status === 200 && !response.error) {
                    console.log('Account update successful');
                    //show GREEN color flash message "Success"                    
                    this.setState({visible:true,success:true,error:false,message:'Success',icon:'thumbs up'});
                    setTimeout(()=>this.setState({visible:false}),1000);                                                                                
                }   
                else {
                    console.log(`ERROR: Account update failed with error ${response.error}`);
                    //show RED color flash message "Failed"                    
                    this.setState({visible:true,success:false,error:true,message:`Failed: ${response.error}`,icon:'thumbs down'});
                    setTimeout(()=>this.setState({visible:false}),1000);                    
                }
            })
            .catch(error=>{
                console.log(`ERROR: error while PUT /account ${error.stack}`);
                this.setState({visible:true,success:false,error:true,message:`ERROR: ${error.stack}`,icon:'thumbs down'});
                setTimeout(()=>this.setState({visible:false}),5000);                    
            })
    }
     
    showTransactions = (e,{name}) => {
        this.setState({activeItem:name});        
        this.props.setRenderTransactions(true,this.accountId,this.accountType);
    }

    logout = (e,{name}) => {
        this.setState({activeItem:name});
        this.props.logout();
    }

    render() {  
        const { visible, success, error, message, icon, activeItem } = this.state;
        return (
          <div>
            <Button
              color="black"
              style={{ float: "right" }}
              icon="arrow alternate circle left"
              onClick={this.navigateBack}
            />
            <Header as="h1" image={this.getLogo()} />

            <div className="account-menu">
              <Menu pointing secondary>
                <Menu.Item name="Show Transactions" active={activeItem === "Show Transactions"} onClick={this.showTransactions}/>
                <Menu.Menu position="right">
                  <Menu.Item name="Logout" active={activeItem === "Logout"} onClick={this.logout}/>
                </Menu.Menu>
              </Menu>
            </div>

            <Form className="account-form" onSubmit={this.clickHandlerFormSubmit}>
              {this.loadFormGroups()}
              <Form.Button
                className="form-button"
                content="Save"
                icon="save"
              />
            </Form>

            <Transition visible={visible}>
              <Message
                style={{ textAlign: "center" }}
                icon={icon}
                success={success}
                error={error}
                content={message}
              />
            </Transition>
          </div>
        );
    }
}