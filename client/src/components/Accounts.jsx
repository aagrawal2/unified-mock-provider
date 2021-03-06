import React from "react";
import lifecycle from 'react-pure-lifecycle';
import { Menu, Dropdown, Button, Header } from "semantic-ui-react";
import ReactTable from 'react-table';
import '../scss/Accounts.scss';
import Provider from '../conf/provider.json';
import ProviderAccounts from '../conf/provider-details.json';
import 'react-table/react-table.css';
import { Link } from "react-router-dom";
import randomstring from 'randomstring';
import Axios from "axios";
import { connect } from "react-redux";
import { getAccounts, addAccount, deleteAccount } from '../actions/actions';
import { getProviderLogo } from '../shared/utility';
import Backend from '../conf/backend.json';

const mapStateToProps = state => {
    return {
        accounts: state.accounts
    };
};

function mapDispatchToProps(dispatch) {
    return {
        getAccounts: (url,config) => dispatch(getAccounts(url,config)),
        addAccount: account => dispatch(addAccount(account)),
        deleteAccount: accountRow => dispatch(deleteAccount(accountRow))
    };
};

//customize lifecycle methods 
const componentDidMount = (props) => {
    const username = props.username;
    const providerName = props.providerName;
    const columns = Provider[props.providerName].accounts;

    includeLinkInAccountId(columns,props);
    includeColumnDeleteAction(props,columns);

    //TODO:Move this state changing logic to redux using redux-thunk OR redux-saga
    //call backend api to get /accounts of an user for a given provider    
    const url = Backend.baseURL+'/user/'+username+'/provider/'+providerName+'/accounts';
    const config = { timeout: Backend.timeout };
    //dispatch an action to Redux store for change in state
    props.getAccounts(url,config);

    /* Axios.get(url, config)
        .then(response => {
            if (response.status === 200 && !response.data.error) {                
                const existingAccounts = response.data;                
                
                //props.getAccount(existingAccounts);                
                //this.setState({ tableData });
            }
        })
        .catch(error => {
            console.log(`ERROR:response from server: ${error.stack}`);
        }); */
};

//make lifecycle methods as properties on standrad object
const methods = {
    componentDidMount
};

/*This method is to deliberately update 'renderAccounts' state of UMP.jsx component for back navigation to work, 
    coz rendering of Account.jsx component is through 'Link' from Accounts.jsx component which changes url path and 
    renders via 'match' prop using 'switch' component. So we don't explcitly change state before rendering Account.jsx component. 
*/
const clickHandlerLink = (props) => {
    props.setRenderAccounts(false,props.providerName);
}

const includeLinkInAccountId = (columns,props) => {
    columns.forEach(column => {
        if (column.accessor === '_id') {
            if(!column.Cell)
                column.Cell = e => <Link to={`/provider/account/${e.value}`} onClick={()=>clickHandlerLink(props)}><u>{e.value}</u></Link>
            return;    
        }
    });
}

const includeColumnDeleteAction = (props,columns) => {
    //check if action column is already part of columns 
    const FOUND_VALUE = columns.find(column => column.Header === 'Action');
    if(FOUND_VALUE) {
        return;
    }
    const action = {
        Header: 'Action',
        Cell: ({ row }) => {
            return <Button icon="delete" color="red" size="mini" onClick={() => { deleteAccountRow(props,row) }} />
        },
        sortable: false,
        width: 70,
        style: {
            textAlign: 'center'
        }
    };
    columns.push(action);
}

const getProviderAccountTypes = (providerName) => {
        const selectedProvider = Provider.names.find(element=>{
            return element.value === providerName;
        });    
        
        return selectedProvider.accounttypes;
}
 
/* const getProviderEntities = (providerName) => {
        const selectedProvider = Provider.names.find(element=>{
            return element.value === providerName;
        });    
        
        return selectedProvider.entities;
} */

//Delete Account 
const deleteAccountRow = (props,row) => {        
        //Delete account from redux store (in-memory)                       
        //make use of redux middleware to have the delete logic outside the react component
        props.deleteAccount(row);  //dispatch delete action
        
        //Delete account from DB filesystem 
        const url = Backend.baseURL+'/user/'+props.username+'/provider/'+props.providerName+'/account/'+row._id;
        const config = {timeout: Backend.timeout};
        Axios.delete(url,config)
            .then(response=>{
                if(response.status === 200 && !response.data.error) {
                    console.log('Account has been successfully deleted from backend');
                }                    
            })
            .catch(error=>{
                console.log(`ERROR: error during Delete /account: ${error.stack}`);
            })
}

//Create Account Handler with default values
const clickHandlerCreateAccount = (event, data, props) => {
    //construct account payload based on provider-accounts.json configuration
    const accountPayload = [{}];
    const accountType = data.children.toLowerCase();
    const providerName = props.providerName;
    const accountTypeFields = ProviderAccounts.accountTypeFields;
    const numericFields = ProviderAccounts.numericFields;
    const alphabeticFields = ProviderAccounts.alphabeticFields;
    const currencyFields = ProviderAccounts.currencyFields;
    const dateFields = ProviderAccounts.dateFields;

    const accountFields = ProviderAccounts[providerName].accounts[accountType];
    accountFields.forEach(element => {
        let field = element.field;

        //handle nested fields using . operator
        const rootObj = {};
        let subObj = rootObj;
        let nestedFieldName = undefined;
        let rootFieldName = undefined;
        if (field.includes('.')) {
            const fields = field.split('.');
            let i = 1;
            for (; i < fields.length - 1; i++) {
                subObj[fields[i]] = {};
                subObj = subObj[fields[i]];
            }
            nestedFieldName = fields[i];
            rootFieldName = fields[0];
        }

        //Logic to assign default values to either nestedField or simpleField 
        if (accountTypeFields.includes(field)) {
            if (nestedFieldName) {
                subObj[nestedFieldName] = accountType;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = accountType;
            }
        }
        else if (field.toLowerCase() === 'status') {
            if (nestedFieldName) {
                subObj[nestedFieldName] = 'OPEN';
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = 'OPEN';
            }
        }
        else if (field.toLowerCase().includes('rate')) {
            const oneDigitValue = randomstring.generate({
                length: 1,
                charset: 'numeric'
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = oneDigitValue + '%';
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = oneDigitValue + '%';
            }
        }
        else if (dateFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            if (nestedFieldName) {
                subObj[nestedFieldName] = new Date().toISOString();
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = new Date().toISOString();
            }
        }
        else if (numericFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            const numericOnly = randomstring.generate({
                length: 5,
                charset: 'numeric'
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = numericOnly;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = numericOnly;
            }

        }
        else if (alphabeticFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            const alphabeticOnly = randomstring.generate({
                length: 7,
                charset: 'alphabetic'
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = alphabeticOnly;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = alphabeticOnly;
            }
        }
        else if (currencyFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            if (nestedFieldName) {
                subObj[nestedFieldName] = 'USD';
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = 'USD';
            }
        }
        else {
            const alphanumeric = randomstring.generate(7);
            if (nestedFieldName) {
                subObj[nestedFieldName] = alphanumeric;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = alphanumeric;
            }
        }
    });

    //call backend api to create account 
    const url = Backend.baseURL+'/user/'+props.username+'/provider/'+providerName+'/accounts';
    const config = { timeout: Backend.timeout };
    Axios.post(url, accountPayload, config)
        .then(response => {
            if (response.status === 201) {
                //refresh this component to reflect the newly added account
                //Use of redux and middleware 
                props.addAccount(response.data[0]);
                /* const tableData = [ ...props.tableData ];
                tableData.push(response.data[0]);
                //dispatch an action to redux store for the change in state
                props.addAccount(tableData); */
                /* const tableData = [...this.state.tableData];
                tableData.push(response.data[0])
                this.setState({ tableData }) */
            }
        })
        .catch(error => {
            console.log(`error while creating account-${error.stack}`);
        });
};

const loadProviderDropdownItems = (props) => {
    const dropdownItems = [];
    const accountTypes = getProviderAccountTypes(props.providerName);
    accountTypes.forEach(value => {
        const key = randomstring.generate(4);
        dropdownItems.push(<Dropdown.Item key={key} onClick={(event,data)=>clickHandlerCreateAccount(event,data,props)}>{value}</Dropdown.Item>)
    });
    return dropdownItems;
}
    
/* const loadProviderMenuItems = (props) => {
        const dropdownItems = [];        
        const entities = getProviderEntities(props.providerName);
        entities.forEach((value,index) => {
            if(value.toLowerCase() === 'account') {
                const dropdownItem = <Dropdown key={index} item text="Create Accounts">
                        <Dropdown.Menu>
                            <Dropdown.Header>with default values</Dropdown.Header>
                                {loadProviderDropdownItems(props)}
                        </Dropdown.Menu>
                    </Dropdown>                
                dropdownItems.push(dropdownItem);
            }
            else if(value.toLowerCase() === 'transaction') {
                const dropdownItem = <Dropdown key={index} item text="Create Transactions" />;
                dropdownItems.push(dropdownItem);
            }
            else if(value.toLowerCase() === 'bill') {
                const dropdownItem = <Dropdown key={index} item text="Create Bills" />;
                dropdownItems.push(dropdownItem);
            }           
        });
        
        return dropdownItems;
} */

//navigateBack = () => this.props.history.push('/provider')
//const navigateBack = () => props.navigateBack()

const AccountsRedux = (props) => {
    const { providerName, accounts } = props;            
    const columns = Provider[providerName].accounts;
    
    const navigateBack = () => props.navigateBack();

    return (
        <div>
            <Button color="black" style={{ float: "right" }} icon="arrow alternate circle left" onClick={navigateBack} />
            <Header as="h1" image={getProviderLogo(providerName)}/>
            <div className="accounts">
                <Menu pointing secondary>
                    <Dropdown item text="Create Accounts">
                        <Dropdown.Menu>
                            <Dropdown.Header>with default values</Dropdown.Header>
                                {loadProviderDropdownItems(props)}
                        </Dropdown.Menu>
                    </Dropdown>                    
                    <Menu.Menu position="right">
                        <Menu.Item name="Logout" />
                    </Menu.Menu>
                </Menu>
            </div>
            <ReactTable className="accounts-table" defaultPageSize={5} data={accounts} columns={columns}
                noDataText="You don't have any accounts yet" />
        </div>
    );
};

//decorate the component
const AccountsReduxDecorated = lifecycle(methods)(AccountsRedux);

//connect required redux store & it's corresponding actions with react component
const Accounts = connect(mapStateToProps,mapDispatchToProps)(AccountsReduxDecorated);

export default Accounts;

/* export default class Accounts extends Component {

    constructor (props) {
        super (props);
        this.providerName = this.props.providerName;     
        this.username = this.props.username;
        this.columns = [...Provider[this.providerName]]; 
        this.state = {
            tableData: undefined
        };        
    }

    includeLinkInAccountId = (columns) => {
        columns.forEach(column=>{
            if(column.accessor === '_id') {
                column.Cell = e=><Link to={`/provider/account/${e.value}`}><u>{e.value}</u></Link>
            }
        });
    }

    includeColumnDeleteAction = (columns) => {
        const action = {
            Header: 'Action',
            Cell: ({row}) => {                
                return <Button icon="delete" color="red" size="mini" onClick={()=>{this.deleteAccountRow(row)}}/>
            },
            sortable: false,
            width: 70            
        };
        columns.push(action);
    }

    componentDidMount = () => {
        this.includeLinkInAccountId(this.columns);
        this.includeColumnDeleteAction(this.columns);

        //call backend api to get /accounts of an user for a given provider
        const url = 'https://localhost/ump/user/'+this.username+'/provider/'+this.providerName+'/accounts';
        const config = {timeout:10000};  
        Axios.get(url,config)
            .then(response=>{
                if(response.status === 200 && !response.data.error) {
                    const tableData = response.data;
                    this.setState({tableData});
                }
            })
            .catch(error=>{
                console.log(`ERROR:response from server: ${error.stack}`);
            })
    }

    getProviderAccountTypes = () => {
        const selectedProvider = Provider.names.find(element=>{
            return element.value === this.providerName;
        });    
        
        return selectedProvider.accounttypes;
    }
 
    getProviderEntities = () => {
        const selectedProvider = Provider.names.find(element=>{
            return element.value === this.providerName;
        });    
        
        return selectedProvider.entities;
    }

    //Delete Account 
    deleteAccountRow = row => {        
        //Delete account from tableData in-memory
        const tableData = this.state.tableData.filter(element=>(element._id !== row._id));
        this.setState({tableData});
        
        //Delete account from DB filesystem 
        const url = 'https://localhost/ump/user/'+this.username+'/provider/'+this.providerName+'/account/'+row._id;
        const config = {timeout:10000};
        Axios.delete(url,config)
            .then(response=>{
                if(response.status === 200 && !response.data.error) {
                    console.log('Account has been successfully deleted from backend');
                }                    
            })
            .catch(error=>{
                console.log(`ERROR: error during Delete /account: ${error.stack}`);
            })
    }

    //Create Account with default values
    clickHandlerCreateAccount = (event, data) => {
        //construct account payload based on provider-accounts.json configuration
        const accountPayload = [{}];
        const accountType = data.children.toLowerCase();
        const providerName = this.providerName;
        const accountTypeFields = ProviderAccounts.accountTypeFields;
        const numericFields = ProviderAccounts.numericFields;
        const alphabeticFields = ProviderAccounts.alphabeticFields;
        const currencyFields = ProviderAccounts.currencyFields;
        const dateFields = ProviderAccounts.dateFields;

        const accountFields = ProviderAccounts[providerName][accountType];
        accountFields.forEach(element=>{
            let field = element.field;

            //handle nested fields using . operator
            const rootObj = {};
            let subObj = rootObj;
            let nestedFieldName = undefined;
            let rootFieldName = undefined;
            if(field.includes('.')) {
                const fields = field.split('.');                
                let i = 1;          
                for(; i<fields.length-1; i++) {
                    subObj[fields[i]] = {};
                    subObj = subObj[fields[i]];
                }
                nestedFieldName = fields[i];
                rootFieldName = fields[0];
            }                                                                    

            //Logic to assign default values to either nestedField or simpleField 
            if(accountTypeFields.includes(field)) {
                if(nestedFieldName) {
                    subObj[nestedFieldName] = accountType;
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {
                    accountPayload[0][field] = accountType;
                }    
            }
            else if(field.toLowerCase() === 'status') {
                if(nestedFieldName) {
                    subObj[nestedFieldName] = 'OPEN';
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {
                    accountPayload[0][field] = 'OPEN';
                }
            } 
            else if(field.toLowerCase().includes('rate')) {
                const oneDigitValue = randomstring.generate({
                    length: 1,
                    charset: 'numeric'
                });
                if(nestedFieldName) {                    
                    subObj[nestedFieldName] = oneDigitValue+'%';
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {
                    accountPayload[0][field] = oneDigitValue+'%';
                }
            }
            else if(dateFields.find(subField=>{
                return field.toLowerCase().includes(subField.toLowerCase());                
            })) {
                if(nestedFieldName) {                    
                    subObj[nestedFieldName] = new Date().toISOString();
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {                    
                    accountPayload[0][field] = new Date().toISOString();
                }
            }               
            else if(numericFields.find(subField=>{
                return field.toLowerCase().includes(subField.toLowerCase());
            })) {
                const numericOnly = randomstring.generate({
                    length: 5,
                    charset: 'numeric'
                });
                if(nestedFieldName) {
                    subObj[nestedFieldName] = numericOnly;
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {
                    accountPayload[0][field] = numericOnly;
                }
                
            }
            else if(alphabeticFields.find(subField=>{
                return field.toLowerCase().includes(subField.toLowerCase());
            })) {
                const alphabeticOnly = randomstring.generate({
                    length: 7,
                    charset: 'alphabetic'
                });
                if(nestedFieldName) {
                    subObj[nestedFieldName] = alphabeticOnly;
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {
                    accountPayload[0][field] = alphabeticOnly;
                } 
            }
            else if(currencyFields.find(subField=>{
                return field.toLowerCase().includes(subField.toLowerCase());
            })) {
                if(nestedFieldName) {
                    subObj[nestedFieldName] = 'USD';
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {
                    accountPayload[0][field] = 'USD';
                }
            }            
            else {
                const alphanumeric = randomstring.generate(7);
                if(nestedFieldName) {
                    subObj[nestedFieldName] = alphanumeric;
                    accountPayload[0][rootFieldName] = rootObj;
                }
                else {
                    accountPayload[0][field] = alphanumeric;
                }                
            }                            
        });
        
        //call backend api to create account 
        const url = 'https://localhost/ump/user/'+this.username+'/provider/'+providerName+'/accounts';
        const config = {timeout:10000};
        Axios.post(url,accountPayload,config)
            .then(response=>{
                if(response.status === 201) {
                    //refresh this component to reflect the newly added account
                    const tableData = [...this.state.tableData];
                    tableData.push(response.data[0])
                    this.setState({tableData})                    
                }
            })
            .catch(error=>{
                console.log(`error while creating account-${error.stack}`);
            });
    }

    loadProviderDropdownItems = () => {
        const dropdownItems = [];
        const accountTypes = this.getProviderAccountTypes();
        accountTypes.forEach(value=>{
            const key = randomstring.generate(4);
            dropdownItems.push(<Dropdown.Item key={key} onClick={this.clickHandlerCreateAccount}>{value}</Dropdown.Item>)
        });
        return dropdownItems;
    }
    
    loadProviderMenuItems = () => {
        const dropdownItems = [];        
        const entities = this.getProviderEntities();
        entities.forEach((value,index) => {
            if(value.toLowerCase() === 'account') {
                const dropdownItem = <Dropdown key={index} item text="Create Accounts">
                        <Dropdown.Menu>
                            <Dropdown.Header>with default values</Dropdown.Header>
                                {this.loadProviderDropdownItems()}
                        </Dropdown.Menu>
                    </Dropdown>                
                dropdownItems.push(dropdownItem);
            }
            else if(value.toLowerCase() === 'transaction') {
                const dropdownItem = <Dropdown key={index} item text="Create Transactions" />;
                dropdownItems.push(dropdownItem);
            }
            else if(value.toLowerCase() === 'bill') {
                const dropdownItem = <Dropdown key={index} item text="Create Bills" />;
                dropdownItems.push(dropdownItem);
            }           
        });
        
        return dropdownItems;
    }

    //navigateBack = () => this.props.history.push('/provider')
    navigateBack = () => this.props.navigateBack()
    
    render () {        
        const {tableData} = this.state;          
    
        return (
            <div>
                <Button color="black" style={{float:"right"}} icon="arrow alternate circle left" onClick={this.navigateBack} />
                <div className="accounts">
                    <Menu pointing secondary>                        
                        {this.loadProviderMenuItems()}
                        <Menu.Menu position="right">
                            <Menu.Item name="Logout"/>
                        </Menu.Menu>
                    </Menu>                
                </div>
                <ReactTable className="accounts-table" defaultPageSize={5} data={tableData} columns={this.columns} />
            </div>                        
        );
    }
} */