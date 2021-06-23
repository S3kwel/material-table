import cloneDeep from 'lodash.clonedeep'; 

function getDeltas(oldObject, newObject) {
    let deltas = {}; 
    for (let oldKey of Object.keys(oldObject)) {
        let newData = newObject[oldKey];
        let oldData = oldObject[oldKey]; 
        if (newData != oldData) {
            deltas[oldKey] = newData; 
        }
    }
    return deltas; 
}



function onRowUpdate(newData,oldData,parentState, setTableData, table, ref) {
    let tempState = cloneDeep(parentState);
    let deltas = getDeltas(newData, oldData); 

    //Exit early if the data presented hasn't changed.  
    if (Object.keys(deltas).length === 0) {
        return new Promise((resolve, reject) => {
            resolve();
        }); 
    }

    //Get the specific table being updated.  
    let index = -1; 
    for (let t of tempState.tables) {
        if (t.id == table.id) {
            index = tempState.tables.indexOf(t);
        }
    }

    let tb = tempState.tables[index];
    //Get index of data row in table data.  
    return new Promise((resolve, reject) => {
        const dataUpdate = [...table.data];
        let i = oldData.tableData.id;  //The index of the data in the table's data array.
        dataUpdate[i] = newData;
        tb.data = dataUpdate;
        tempState.tables[index] = tb;

        setTableData(tempState); 
        resolve();
    });
}

function onRowDelete(oldData, parentState, setTableData, table) {
    let tempState = cloneDeep(parentState);
    //Get the specific table being updated.  
    let index = -1;

    for (let t of tempState.tables) {
        if (t.id == table.id) {
            index = tempState.tables.indexOf(t);
        }
    }

    let tb = tempState.tables[index];

    return new Promise((resolve, parentState, reject) => {
        const dataDelete = [...table.data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        tb.data = dataDelete;
        tempState.tables[index] = tb; 

        setTableData(tempState);
        resolve(); 

    });
}

function onRowAdd(newData) {
    return new Promise((resolve, reject) => {
        setData([...data, newData]); 
        resolve(); 
    });
}

const defaultCrud = {
    add: onRowAdd, 
    delete: onRowDelete,
    update: onRowUpdate
}

export default defaultCrud; 