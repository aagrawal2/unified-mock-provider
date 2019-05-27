const initialState = {    
    accounts: [],
    transactions: [],
    modalOpen: false,
    nestedModalOpen: false,
    searchQuery: '',
    startDate: new Date().setDate(new Date().getDate() - 90), //90 days back is initial start date
    endDate: new Date() //now
}

const reducer = (state = initialState, action) => {    
    if(action.type === 'EXISTING_ACCOUNTS' || action.type === 'ACCOUNTS_POST_ADD' || action.type === 'ACCOUNTS_POST_DELETE') {
        const newState = { ...state };
        newState.accounts = action.payload;
        return newState;
    }
    else if(action.type === 'EXISTING_TRANSACTIONS' || action.type === 'TRANSACTIONS_POST_ADD' || action.type === 'TRANSACTIONS_POST_DELETE') {
        const newState = { ...state };
        newState.transactions = action.payload;
        return newState;
    }  
    else if(action.type === 'INPUT_NUM_TXNS') {
        const newState = { ...state };
        newState.searchQuery = action.payload;
        return newState;
    } 
    else if(action.type === 'SET_MODAL_OPEN') {
        const newState = { ...state };
        newState.modalOpen = action.payload;
        return newState;
    }
    else if(action.type === 'SET_NESTED_MODAL_OPEN') {
        const newState = { ...state };
        newState.nestedModalOpen = action.payload;
        return newState;
    }
    else if(action.type === 'SET_START_DATE') {
        const newState = { ...state };
        newState.startDate = action.payload;
        return newState;
    }
    else if(action.type === 'SET_END_DATE') {
        const newState = { ...state };
        newState.endDate = action.payload;
        return newState;
    }
    else
        return state;
}

export default reducer;