const initialState = {    
    tableData: undefined
}

const reducer = (state = initialState, action) => {    
    if(action.type === 'GET_ACCOUNT' || action.type === 'ADD_ACCOUNT' || action.type === 'DEL_ACCOUNT') {
        const newState = { ...state };
        newState.tableData = action.payload;
        return newState;
    }    
    else
        return state;
}

export default reducer;