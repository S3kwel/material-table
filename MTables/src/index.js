/***
 * FEATURES NEEDED:
 * 1. Table-wide validation
 * 2. Cross-table data comparison.
 * 3. Modals for error messages?
 *
 * */
import React, { useState, useEffect, useRef, forwardRef } from "react";
import ReactDOM from "react-dom";
import MaterialTable from "@material-table/core";
import REGEX from './regex'; 
import defaultCrud from './defaultCrud'; 
import Defaults from './defaults'; 
import "../MTables.css";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core"; 
import { Paper } from '@material-ui/core';
import { MTableToolbar } from '@material-table/core'; 

console.clear(); 








const MTableOptions = {
    display: {},
    validation: {
        1: {
            rowFormula: "SUM(*) = 100",
            required: ["name"],
            columns: [
                {
                    field: "name", 
                    type: "string",
                    min: 5, 
                    max: 50
                },
                {
                    field: "lastName", 
                    type: "string",
                    min: 5,
                    max: 50
                },
                {
                    field: "number", 
                    type: "number", 
                    min: 5, 
                    max: 22
                }
                ]
            }
        },
    tables: [
        {
            id: "1",
            title: "Table One",
            options: null, //Could be an override that uses material-table options. 
            columns: [
                { title: "First Name", field: "name" },
                { title: "Last Name", field: "lastName" },
                { title: "Number", field: "number" },
                { title: "Test", field: "complexData.value" },
            ],
            data: [
                { name: "Dustin", lastName: "Hickman", complexData: { id: 0, value: "TEST" }, number: 33 },
                { name: "Dustin", lastName: "Hickman", complexData: { id: 0, value: "TEST" }, number: 33 },
                { name: "Dustin", lastName: "Hickman", complexData: { id: 0, value: "TEST" }, number: 33 },
            ],
            editable: {
                state: true,
                submitMode: {
                    type: "API",
                    url: "/test",
                    valueType: "basic",
                }
            },
            nestedData: { used: true, preserveKeys: false },
            mtableProps: {}
        },
    ]
}

function MTable(props) {
    const tableRef = useRef(null); 
    const [tableData, setTableData] = useState(null); 
    var sourceData = null; 


    useEffect(() => {
        init(sourceData); 
    }, []);






    if (tableData != null) {sourceData = tableData.tables}
    else {sourceData = props.tables;}

    function parseData(table) {
        //If the table is using nested data, we will need to expand the object.  
        if (table.nestedData) {
            if (table.nestedData.used) {
                for (let datum of table.data) {
                    let tempData = JSON.parse(JSON.stringify(datum)); 

                    for (let dataKey of Object.keys(datum)) {
                        if (typeof datum[dataKey] === 'object') {
                            for (let subKey of Object.keys(datum[dataKey])) {
                                let expandedKey = `${dataKey}.${subKey}`; 
                                let object = datum[dataKey]; 
                                tempData[expandedKey] = object[subKey]; 
                                //If the user has specified in the nestedData object, delete the original key. 
                                if (!table.nestedData.preserveKeys) {
                                    delete tempData[dataKey];
                                }
                            }
                         
                        }
                    }
                    table.data[table.data.indexOf(datum)] = tempData; 
                }
            }
        }
    }

    function parseFormula(formula, thisRow) {
        let functionCheck = REGEX.parse('func', formula); 

        //If this property exists, there were results.  
        if (functionCheck.name) {
            let name = functionCheck.name.toLowerCase(); 
            let params = functionCheck.params.toLowerCase(); 
        }
        


    }

    function parseValidation(table) {
        if (!props.validation) { return; }
        if (!props.validation[table.id]) { console.log(`No validation constraints found for table ${table.name || table.id}`); return}
        let validation = props.validation[table.id];

        //Check table-level validation.  
        for (let valKey of Object.keys(validation)) {
            if (valKey == 'rowFormula') {
                parseFormula(validation.rowFormula, table.data, table);
            }
        } 

        //Check column-level validation.  
        if (validation.columns) {
            //Validation functions return booleans in material-table.  
            
            for (let col of validation.columns) {
                let colIndex = validation.columns.indexOf(col); 
                let temp = " return ";
                let functionParts = {}; 


                //Numeric functions.  
                if (col.type && col.type == "number") {
                    if (col.min) {
                        functionParts['min'] = `value >= ${col.min}`;
                    }
                    if (col.max) {
                        functionParts['max'] = `value >= ${col.max}`;
                    }
                }
                //String functions. 
                else if (col.type && col.type == "string") {
                    if (col.min) {
                        functionParts['min'] = `value.length >= ${col.min}`;
                    }
                    if (col.max) {
                        functionParts['max'] = `value.length <= ${col.max}`;
                    }
                }

                if (functionParts != {}) {
                    for (let key of Object.keys(functionParts)) {
                        temp += `${functionParts[key]} && `; 
                    }


                    if (temp.endsWith('&& ')) {
                        temp = temp.substring(0, temp.length - 4); // Trailing space, && and space behind it. 
                    }

                    temp += ";"; 

                    let tempFunc = new Function('value', temp); 

                    //Flush the function is as validation for material-table.  
                    
                    props.tables[props.tables.indexOf(table)].columns[colIndex]['validate'] = r => tempFunc(r[props.tables[props.tables.indexOf(table)].columns[colIndex].field]); 

                   
                }
            }
        }
    }

    function parseMutation(table, sourceData) {
        let temp = {
            onRowAdd: rowData => defaultCrud.add, 
            onRowUpdate: (newData, oldData) => defaultCrud.update(newData, oldData, props, setTableDataFromChild, table, tableRef), 
            onRowDelete: oldData => defaultCrud.delete(oldData,props,setTableDataFromChild, table)
        }        
        table.mtableProps.editable = temp; 
    }

    function setTableDataFromChild(newState) {
        console.log("newState", newState); 
        setTableData(newState); 
    }

    function init(sourceData) {
        for (let table of sourceData) {
            let friendlyName = table.title || table.id; //Only used in logging.  

            if (!table.columns) {
                console.warn(`No columns were specified for table ${friendlyName}; ending processing for this table.`);
                continue;
            }

            if (table.data) {
                parseData(table);
                parseValidation(table);
            }



            if (table.editable && table.editable.state) {
                parseMutation(table, sourceData);
            }
        }
        setTableData(props);
    }

    
   

    let tables = []; 
     
    for (let table of sourceData) {
        let display = props.display[table.id] || Defaults.display;  

        let tempData = {
            key: table.id,
            columns: table.columns, 
            data: table.data,  
            title: table.title || null,
            editable: table.mtableProps.editable || null, 
            renderSummaryRow: ({ data, index, columns }) => { },
            tableRef: tableRef,
            options: display 
        };
        let key = new Date().getTime(); 

        tables.push(
            <MuiThemeProvider key={"mtable_"+key} theme={createMuiTheme(display.theme)}>
                <MaterialTable {...tempData} />
            </MuiThemeProvider>
        );
    }
          
    return (<div> {tables} </div>); 

}

ReactDOM.render(<MTable {...MTableOptions} />, document.getElementById("App"));

module.hot.accept();
