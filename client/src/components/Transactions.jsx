import React from "react";
import lifecycle from 'react-pure-lifecycle';
import { Menu, Dropdown, Button, Header, Modal, Label} from "semantic-ui-react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactTable from 'react-table';
import '../scss/Transactions.scss';
import Provider from '../conf/provider.json';
import ProviderTransactions from '../conf/provider-details.json';
import 'react-table/react-table.css';
import { Link } from "react-router-dom";
import randomstring from 'randomstring';
import Axios from "axios";
import { connect } from "react-redux";
import { getTransactions, addTransactions, deleteTransaction, inputNumOfTxns, setModalOpen, setNestedModalOpen, setStartDate, setEndDate } from '../actions/ActionsTransaction';
import { getProviderLogo } from '../shared/utility';
import Backend from '../conf/backend.json';

const mapStateToProps = state => {
    return {
        transactions: state.transactions,
        searchQuery: state.searchQuery, 
        modalOpen: state.modalOpen,        
        nestedModalOpen: state.nestedModalOpen,
        startDate: state.startDate,
        endDate: state.endDate
    };
};

function mapDispatchToProps(dispatch) {
    return {
        getTransactions: (url,config) => dispatch(getTransactions(url,config)),
        addTransactions: (url,txnPayload,config) => dispatch(addTransactions(url,txnPayload,config)),
        deleteTransaction: transactionRow => dispatch(deleteTransaction(transactionRow)),
        inputNumOfTxns: num => dispatch(inputNumOfTxns(num)),
        setModalOpen: flag => dispatch(setModalOpen(flag)),
        setNestedModalOpen: flag => dispatch(setNestedModalOpen(flag)),
        setStartDate: date => dispatch(setStartDate(date)),
        setEndDate: date => dispatch(setEndDate(date))
    };
};

//customize lifecycle methods 
const componentDidMount = (props) => {
    const username = props.username;
    const providerName = props.providerName;
    const accountId = props.accountId;
    const columns = Provider[props.providerName].transactions;

    includeLinkInTransactionId(columns,accountId);
    includeColumnDeleteAction(props,columns);

    //State changing logic is in redux using redux-thunk OR redux-saga
    //call backend api to get /transactions of an user for a given provider in a given account
    const url = Backend.baseURL+'/user/'+username+'/provider/'+providerName+'/account/'+accountId+'/transactions';
    const config = { timeout: Backend.timeout };
    //dispatch an action to Redux store for change in state
    props.getTransactions(url,config);    
};

//make lifecycle methods as properties on standrad object
const methods = {
    componentDidMount
};

const includeLinkInTransactionId = (columns,accountId) => {
    columns.forEach(column => {
        if (column.accessor === '_id') {
            if(!column.Cell)
                column.Cell = e => <Link to={`/provider/account/${accountId}/transaction/${e.value}`}><u>{e.value}</u></Link>
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
            return <Button icon="delete" color="red" size="mini" onClick={() => { deleteTransactionRow(props,row) }} />
        },
        sortable: false,
        width: 70,
        style: {
            textAlign: 'center'
        }
    };
    columns.push(action);
}
 
//Delete Transaction
const deleteTransactionRow = (props,row) => {        
        //Delete transaction from redux store (in-memory)                       
        //make use of redux middleware to have the delete logic outside the react component
        props.deleteTransaction(row);  //dispatch delete action
        
        //Delete transaction from DB filesystem 
        const url = Backend.baseURL+'/user/'+props.username+'/provider/'+props.providerName+'/account/'+props.accountId+'/transaction/'+row._id;
        const config = {timeout: Backend.timeout};
        Axios.delete(url,config)
            .then(response=>{
                if(response.status === 200 && !response.data.error) {
                    console.log('Transaction has been successfully deleted from backend');
                }                    
            })
            .catch(error=>{
                console.log(`ERROR: error during Delete /transaction: ${error.stack}`);
            });
}

let txnStatus = undefined;

const getDates = (startDate,endDate) => {
    const dates = [];
    const date = new Date(startDate);
    while(date <= endDate) {
        dates.push(date);
        date.setDate(date.getDate() + 1);
    }
    return dates;
}

//Create Transaction(s) Handler with default values
const CreateTransactions = (props) => {
    //construct txn payload based on provider-details.json configuration
    const txnPayload = [];
    const accountType = props.accountType.toLowerCase();
    const providerName = props.providerName;  
    const username = props.username; 
    const accountId = props.accountId; 
    const numericFields = ProviderTransactions.numericFields;
    const alphabeticFields = ProviderTransactions.alphabeticFields;
    const currencyFields = ProviderTransactions.currencyFields;
    const dateFields = ProviderTransactions.dateFields;

    const txnFields = ProviderTransactions[providerName].transactions[accountType];

    //Func to build txn object 
    const buildTxnObject = (dateString) => {
        const txnObject = {};
        txnFields.forEach(element => {
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
            //assign status as selected from dropdown posted/pending        
            if (field.toLowerCase() === 'status') {
                if (nestedFieldName) {
                    subObj[nestedFieldName] = txnStatus;
                    txnObject[rootFieldName] = rootObj;
                }
                else {
                    txnObject[field] = txnStatus;
                }
            }        
            else if (dateFields.find(subField => {
                return field.toLowerCase().includes(subField.toLowerCase());
            })) {
                if(dateString) {
                    if (nestedFieldName) {
                        subObj[nestedFieldName] = dateString;
                        txnObject[rootFieldName] = rootObj;
                    }
                    else {
                        txnObject[field] = dateString;
                    }   
                }
                else if(!dateString && !field.toLowerCase().includes("posted")) {
                    if (nestedFieldName) {
                        subObj[nestedFieldName] = new Date().toISOString();
                        txnObject[rootFieldName] = rootObj;
                    }
                    else {
                        txnObject[field] = new Date().toISOString();
                    }
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
                    txnObject[rootFieldName] = rootObj;
                }
                else {
                    txnObject[field] = numericOnly;
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
                    txnObject[rootFieldName] = rootObj;
                }
                else {
                    txnObject[field] = alphabeticOnly;
                }
            }
            else if (currencyFields.find(subField => {
                return field.toLowerCase().includes(subField.toLowerCase());
            })) {
                if (nestedFieldName) {
                    subObj[nestedFieldName] = 'USD';
                    txnObject[rootFieldName] = rootObj;
                }
                else {
                    txnObject[field] = 'USD';
                }
            }
            else {
                const alphanumeric = randomstring.generate(7);
                if (nestedFieldName) {
                    subObj[nestedFieldName] = alphanumeric;
                    txnObject[rootFieldName] = rootObj;
                }
                else {
                    txnObject[field] = alphanumeric;
                }
            }
        });

        return txnObject;
    }
    
    //Create txnPayload based on posted/pending selection by user     
    if(txnStatus.toLowerCase() === 'posted') {  //posted
        //generate posted date between selected startDate & endDate 
        const startDate = props.startDate;
        const endDate = props.endDate;
        const dates = getDates(startDate,endDate);        

        let dateIndex = 0;
        for(let i=1; i<=totalTxns; i++) {                                 
            if(dateIndex === dates.length) 
                dateIndex = 0;
            const date = dates[dateIndex];
            dateIndex++;

            const txnObject = buildTxnObject(date.toISOString());
            txnPayload.push(txnObject);
        }
    }
    else {  //pending        
        for(let i=1; i<=totalTxns; i++) {                                             
            const txnObject = buildTxnObject();
            txnPayload.push(txnObject);
        }
    }

    //call backend api to create transaction via Redux-thunk
    const url = Backend.baseURL+'/user/'+username+'/provider/'+providerName+'/account/'+accountId+'/transactions';
    const config = { timeout: Backend.timeout };
    props.addTransactions(url,txnPayload,config);
};

const clickHandlerNestedModalContinue = (props) => {            
    //close both modal & nested modal 
    props.setModalOpen(false);
    props.setNestedModalOpen(false);

    //Create transactions 
    CreateTransactions(props);
}

let totalTxns = 1;  //Dropdown placeholder value from modal

const onChangeNumOfTxns = (e,{value,searchQuery}) => {    
    totalTxns = value;
}

const nestedModal = (props, txnStatus) => {
    const { nestedModalOpen, startDate, endDate, setStartDate, setEndDate } = props;

    return (
        <Modal trigger={ <Button color="green" icon="checkmark" content="Continue" onClick={()=>props.setNestedModalOpen(true)} />}            
            size="small" 
            open={nestedModalOpen}
            closeOnDimmerClick={false}                                 
        >            
            <Modal.Actions>
                <div className="grid-container">                    
                    <Label icon="calendar alternate outline" content="Start Date" />
                    <Label icon="calendar alternate outline" content="End Date" />                    
                    <DatePicker selected={startDate} onChange={(date)=>setStartDate(date)}/>                                                                        
                    <DatePicker selected={endDate} onChange={(date)=>setEndDate(date)}/>
                </div>
                <div className="button-group-modal2">
                    <Button color="red" icon="cancel" content="Cancel" onClick={()=>props.setNestedModalOpen(false)}/>
                    <Button color="green" icon="checkmark" content="Continue" onClick={()=>clickHandlerNestedModalContinue(props)} />               
                </div>                 
            </Modal.Actions>
        </Modal>                            
    );
}

const TransactionsRedux = (props) => {
    const { providerName, transactions, modalOpen, searchQuery } = props;            
    const columns = Provider[providerName].transactions;

    //this is defined inside the function coz it needs props access
    const clickHandlerCreateTxn = (e,data) => {
        txnStatus = data.children;
        props.setModalOpen(true);
    }

    return (
      <div>
        <Button
          color="black"
          style={{ float: "right" }}
          icon="arrow alternate circle left"
          onClick={props.navigateBack}
        />
        <Header as="h1" image={getProviderLogo(providerName)} />
        <div className="transactions">
          <Menu pointing secondary>
            <Dropdown item text="Create Transactions">
              <Dropdown.Menu>
                <Dropdown.Header>with default values</Dropdown.Header>
                <Modal
                  trigger={<Menu.Item onClick={clickHandlerCreateTxn}>Posted</Menu.Item>}
                  basic
                  size="mini"
                  closeOnDimmerClick={false}
                  open={modalOpen}
                >
                  <Modal.Content>
                    <h3>Enter number of transactions to create</h3>
                  </Modal.Content>
                  <Modal.Actions>
                    <Dropdown
                      options={[
                        { key: 1, text: 1, value: 1 },{ key: 5, text: 5, value: 5 },{ key: 10, text: 10, value: 10 },
                        { key: 20, text: 20, value: 20 }, { key: 50, text: 50, value: 50 }, { key: 100, text: 100, value: 100 }
                      ]}
                      placeholder="1"
                      selection 
                      search
                      searchQuery={searchQuery}                                            
                      onSearchChange={(e,{searchQuery}) => {totalTxns = Number(searchQuery);props.inputNumOfTxns(searchQuery)}}
                      onChange={onChangeNumOfTxns}                                            
                    />                    
                    <div className="button-group-modal1">
                        <Button color="red" icon="cancel" content="Cancel" 
                            onClick={()=>props.setModalOpen(false)} 
                        />                            
                        &nbsp;&nbsp;  
                        {nestedModal(props)}                        
                    </div>                     
                  </Modal.Actions>                  
                </Modal>
                <Menu.Item>Pending</Menu.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Menu.Menu position="right">
              <Menu.Item name="Logout" onClick={() => props.logout()} />
            </Menu.Menu>
          </Menu>
        </div>
        <ReactTable
          className="transactions-table"
          defaultPageSize={5}
          data={transactions}
          columns={columns}
          noDataText="You don't have any transactions yet"
        />          
      </div>      
    );
};

//decorate the component
const TransactionsReduxDecorated = lifecycle(methods)(TransactionsRedux);

//connect required redux store & it's corresponding actions with react component
const Transactions = connect(mapStateToProps,mapDispatchToProps)(TransactionsReduxDecorated);

export default Transactions;

