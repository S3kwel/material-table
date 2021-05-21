
function onRowUpdate(newData, oldData) {
    return new Promise((resolve, reject) => {
        const dataUpdate = [...data];
        const index = oldData.tableData.id;
        dataUpdate[index] = newData;
        setData([...dataUpdate]);
        resolve();
    });
}

function onRowDelete(oldData) {
    return new Promise((resolve, reject) => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
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