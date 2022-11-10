import { accountsRef, createCollectionArray} from "./database";

const colNames = ['firstName', 'lastName', 'email', 'phone', 'totalPolls', 'inactivePolls', 'activePolls', 'votedOn'];

createCollectionArray(accountsRef, 'accountsTable', colNames);