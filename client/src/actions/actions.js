export const getAccount = accountData => {
    return {
        type: 'GET_ACCOUNT',
        payload: accountData
    }
};

export const addAccount = accountData => {
    return {
        type: 'ADD_ACCOUNT',
        payload: accountData
    }
};

export const deleteAccount = accountRow => {
    return {
        type: 'DEL_ACCOUNT',
        payload: accountRow
    }
};