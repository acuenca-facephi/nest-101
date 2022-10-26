import { Transaction } from '../../entities/transaction.entity'
import { createStore } from 'redux'

function changeTransactionStep(transaction: Transaction, step: string): Transaction {
    return { ...transaction, step: step } as Transaction;
}


function changeTransactionStatus(transaction: Transaction, status: string): Transaction {
    return { ...transaction, status: status } as Transaction;
}


function reducer(transaction: Transaction, event: any) {
    let updatedTransaction: Transaction;

    switch (event.type) {
        case 'com.facephi.identityplatform.transaction.event.step_changed':
            updatedTransaction = changeTransactionStep(transaction, event.data.step);
            break;
        case 'com.facephi.identityplatform.transaction.event.status_changed':
            updatedTransaction = changeTransactionStatus(transaction, event.data.status);
            break;
        default:
            if (event.type.includes('@@redux/INIT')) updatedTransaction = transaction;
            else throw new Error(`Type "${event.type}" not allowed.`);
    }

    return updatedTransaction;
}

export function createEventReducer(transaction: Transaction) {
    return createStore(reducer, transaction)
};
