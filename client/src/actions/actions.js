export const getAccount = accounts => {
    return {
        type: 'GET_ACCOUNT',
        payload: accounts
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