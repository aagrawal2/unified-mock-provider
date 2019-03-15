import React, { Component } from "react";
import { Menu, Dropdown, Button } from "semantic-ui-react";
import ReactTable from 'react-table';
import '../scss/Account.scss';
import Provider from '../conf/provider.json';
import 'react-table/react-table.css';

export default class Account extends Component {

    constructor (props) {
        super (props);
    }

    //navigateBack = () => this.props.history.push('/provider')
    navigateBack = () => this.props.navigateBack()
    
    render () {        
        const columns = Provider[this.props.providerName];
        const tableData = this.props.accountData;
        
        return (
            <div>
                <Button color="black" style={{float:"right"}} icon="arrow alternate circle left" onClick={this.navigateBack} />
                <div className="account">
                    <Menu pointing secondary>
                        <Dropdown item text="Create Accounts"> 
                            <Dropdown.Menu>
                                <Dropdown.Header>with default values</Dropdown.Header>
                                <Dropdown.Item>Checking</Dropdown.Item>
                                <Dropdown.Item>Saving</Dropdown.Item>
                                <Dropdown.Item>Credit Card</Dropdown.Item>
                            </Dropdown.Menu>                                   
                        </Dropdown>    
                        <Dropdown item text="Create Transactions" />
                        <Dropdown item text="Create Bills" />
                        <Menu.Menu position="right">
                            <Menu.Item name="Logout"/>
                        </Menu.Menu>
                    </Menu>                
                </div>
                <ReactTable className="account-table" data={tableData} columns={columns} />
            </div>                        
        );
    }
}