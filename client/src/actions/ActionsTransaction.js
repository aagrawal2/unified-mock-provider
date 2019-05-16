import Axios from "axios";

export const inputNumOfTxns = num => {
    return {
        type: 'INPUT_NUM_TXNS',
        payload: num
    };
}

export const setModalOpen = flag => {
    return {
        type: 'SET_MODAL_OPEN',
        payload: flag
    }
}

export const setNestedModalOpen = flag => {
    return {
        type: 'SET_NESTED_MODAL_OPEN',
        payload: flag
    }
}

export const setStartDate = date => {
    return {
        type: 'SET_START_DATE',
        payload: date
    }
}

export const setEndDate = date => {
    return {
        type: 'SET_END_DATE',
        payload: date
    }
}

export const getTransactions = (url,config) => {    
    //return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch,getState) => {
        Axios.get(url,config)
            .then(response => {
                if(response.status === 200 && !response.data.error) {
                    const existingTransactions = response.data;
                    const action = {
                        type: 'EXISTING_TRANSACTIONS',
                        payload: existingTransactions
                    };
                    dispatch(action);
                }
            })
            .catch(error => {
                console.log(`Error response from server:${error.stack}`);
                const action = {
                    type: 'ERROR',
                    payload: error.stack
                };
                dispatch(action);
            });
    }
};

export const addTransactions = (url,txnPayload,config) => {    
    //return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch,getState) => {
        Axios.post(url,txnPayload,config)
            .then(response => {
                if(response.status === 201 && !response.data.error) {
                    const newTransactions = response.data;
                    const action = {
                        type: 'ADD_TRANSACTIONS',
                        payload: newTransactions
                    };
                    dispatch(action);
                }
            })
            .catch(error => {
                console.log(`Error response from server:${error.stack}`);
                const action = {
                    type: 'ERROR',
                    payload: error.stack
                };
                dispatch(action);
            });
    }
};

export const deleteTransaction = transactionRow => {
    return {
        type: 'DEL_TRANSACTION',
        payload: transactionRow
    }
};