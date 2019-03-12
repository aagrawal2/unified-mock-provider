import React, { Component } from "react";
import { Menu, Dropdown } from "semantic-ui-react";
import '../scss/Account.scss';

export default class Account extends Component {

    constructor (props) {
        super (props);
    }

    render () {        
        return (
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
        );
    }
}