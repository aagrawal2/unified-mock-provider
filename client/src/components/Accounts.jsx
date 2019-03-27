import React, { Component } from "react";
import { Menu, Dropdown, Button } from "semantic-ui-react";
import ReactTable from 'react-table';
import '../scss/Accounts.scss';
import Provider from '../conf/provider.json';
import 'react-table/react-table.css';
import { Link } from "react-router-dom";

export default class Accounts extends Component {

    /* constructor (props) {
        super (props);
        console.log('inside Acount constructor');          
    } */
    providerName = this.props.providerName; 
    includeLinkInAccountId = (columns) => {
        columns.forEach(column=>{
            if(column.accessor === '_id') {
                column.Cell = e=><Link to={`/provider/account/${e.value}`}><u>{e.value}</u></Link>
            }
        });
    }

    //navigateBack = () => this.props.history.push('/provider')
    navigateBack = () => this.props.navigateBack()
    
    render () {        
        const columns = Provider[this.providerName]; 
        this.includeLinkInAccountId(columns);    
        const tableData = this.props.accountData;  
        
        return (
            <div>
                <Button color="black" style={{float:"right"}} icon="arrow alternate circle left" onClick={this.navigateBack} />
                <div className="accounts">
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
                <ReactTable pageSize="10" className="accounts-table" data={tableData} columns={columns} />
            </div>                        
        );
    }
}