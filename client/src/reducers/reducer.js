const initialState = {    
    accounts: undefined
}

const reducer = (state = initialState, action) => {    
    if(action.type === 'EXISTING_ACCOUNTS' || action.type === 'ACCOUNTS_POST_ADD' || action.type === 'ACCOUNTS_POST_DELETE') {
        const newState = { ...state };
        newState.accounts = action.payload;
        return newState;
    }    
    else
        return state;
}

export default reducer;