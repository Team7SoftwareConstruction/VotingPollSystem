import { accountsRef, addTableData} from "./database";

const colNames = ['firstName', 'lastName', 'email', 'phone', 'totalPolls', 'inactivePolls', 'activePolls'];

addTableData(accountsRef, 'accountsTable', colNames);