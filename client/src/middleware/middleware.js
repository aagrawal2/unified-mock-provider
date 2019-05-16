

const middlewareAction = ({getState, dispatch}) => {
    return next => {
        return action => {            
            if(action.type === 'ADD_ACCOUNT') {
                action.type = 'ACCOUNTS_POST_ADD';
                const copyCurrentStateAccounts = [ ...getState().accounts ];
                copyCurrentStateAccounts.push(action.payload);
                action.payload = copyCurrentStateAccounts;
                return dispatch(action);
            }
            else if(action.type === 'DEL_ACCOUNT') {
                const currentState = getState();
                const filteredAccounts = currentState.accounts.filter(account => account._id !== action.payload._id);
                action.type = 'ACCOUNTS_POST_DELETE';
                action.payload = filteredAccounts;
                return dispatch(action);                
            }
            if(action.type === 'ADD_TRANSACTIONS') {
                action.type = 'TRANSACTIONS_POST_ADD';
                const copyCurrentStateTxns = [ ...getState().transactions ];
                action.payload.forEach(transaction => copyCurrentStateTxns.push(transaction));                                
                action.payload = copyCurrentStateTxns;
                return dispatch(action);
            }
            else if(action.type === 'DEL_TRANSACTION') {
                const currentState = getState();
                const filteredTxns = currentState.transactions.filter(transaction => transaction._id !== transaction.payload._id);
                action.type = 'TRANSACTIONS_POST_DELETE';
                action.payload = filteredTxns;
                return dispatch(action);                
            }
            else 
                return next(action);
        };
    };    
};

export default middlewareAction;