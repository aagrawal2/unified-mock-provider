

const middlewareAction = ({getState, dispatch}) => {
    return next => {
        return action => {
            if(action.type === 'GET_ACCOUNT') {
                action.type = 'EXISTING_ACCOUNTS';
                return dispatch(action);
            }
            else if(action.type === 'ADD_ACCOUNT') {
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
            else 
                return next(action);
        };
    };    
};

export default middlewareAction;