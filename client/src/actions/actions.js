import Axios from "axios";

export const getAccounts = (url,config) => {    
    //return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch,getState) => {
        Axios.get(url,config)
            .then(response => {
                if(response.status === 200 && !response.data.error) {
                    const existingAccounts = response.data;
                    const action = {
                        type: 'EXISTING_ACCOUNTS',
                        payload: existingAccounts
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

export const addAccount = account => {
    return {
        type: 'ADD_ACCOUNT',
        payload: account
    }
};

export const deleteAccount = accountRow => {
    return {
        type: 'DEL_ACCOUNT',
        payload: accountRow
    }
};

