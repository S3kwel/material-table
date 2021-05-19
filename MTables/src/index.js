/***
 * FEATURES NEEDED:
 * 1. Table-wide validation
 * 2. Cross-table data comparison.
 * 3. Modals for error messages?
 *
 * */
import React, { useState } from "react";
import ReactDOM from "react-dom";
import MaterialTable from "material-table";
import REGEX from './regex'; 
import "../MTables.css";

console.clear(); 

const MTableOptions = {
    display: {
        default: {
            showTitle: true, //Sets toolbar.  
            addEmptyRows: false, //Sets emptyRowsWhenPaging. 
            pagination: false //sets paging.
        }
    },
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
            ],
            data: [
                { name: "Dustin", surname: "Hickman", complexData: {id: 0, value: "TEST"} },
            ],
            nestedData: {used: true, preserveKeys: false}
        }
    ]
}

function MTable(props) {
    const [tableData, setTableData] = useState({}); 

    function parseData(table) {
        console.log(`parsing data for table ${table.name || table.id}...`); 
       
        //If the table is using nested data, we will need to expand the object.  
        if (table.nestedData) {

            if (table.nestedData.used) {
                console.log("expanding tale data");
                for (let datum of table.data) {
                    let tempData = JSON.parse(JSON.stringify(datum)); 

                    for (let dataKey of Object.keys(datum)) {
                        if (typeof datum[dataKey] === 'object') {
                            console.log(`found nested data for ${dataKey}`);
                            for (let subKey of Object.keys(datum[dataKey])) {
                                let expandedKey = `${dataKey}.${subKey}`; 
                                let object = datum[dataKey]; 
                                tempData[expandedKey] = object[subKey]; 
                                //If the user has specified in the nestedData object, delete the original key. 
                                if (!table.nestedData.preserveKeys) {
                                    delete tempData[dataKey];
                                }
                            }
                            console.log('original row', datum); 
                            console.log('modified row', tempData);
                            table.data = tempData; 

                        }
                    }
                }
            }
            console.log("------"); 


        }
    }

    function parseFormula(formula, thisRow) {
        console.log(`Parsing a formula: ${formula}`); 
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
                let temp = "return ";
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
                    props.tables[props.tables.indexOf(table)].columns[colIndex]['validate'] = r => tempFunc(r); 

                   
                }
            }
            console.log(props.tables); 
        }

        

        console.log("-----");
    }

    //Initial state setup.
    console.log()
    if (Object.keys(tableData).length == 0) {
        for (let table of props.tables) {
            let friendlyName = table.title || table.id; //Only used in logging.  

            if (!table.columns) {
                console.warn(`No columns were specified for table ${friendlyName}; ending processing for this table.`);
                continue;
            }

            if (table.data) {
                parseData(table);
            }
            console.log(`Parsing validation constraints for ${friendlyName}...`);
            parseValidation(table);
        }
        setTableData(props);
    }

    else {
        console.log(props); 
    }



   


    return (<div />); 
}



/****
 * Validation Semantics:
 * rowFormula: Each row in the table isn't valid unless it satisfies this formula.
 * - Some convenience notation provided. 
 *    - <SUM> :  The sum of all columns in this row.
 * - As much as possible, use natural mathematical language to enforce.
 * - strings in square brackets represent the value of individual columns.
 *    - i.e. [ColumnA] + [ColumnB] = 100
 * */


//Design intent:  Allow passthrough to all the props material-table uses in its options, but provide convenience props in mine.  

const options = {
    emptyRowsWhenPaging: false, //Prevents the tables from padding rows to meet the page requirements.  
    header: true, //Reference, hides the column names. 
    headerStyle: {},
    padding: "dense", //dense to reduce padding. 
    paging: false,  // Whether to use paging.  
    search: false,  // Whether to show the search bar.
    toolbar: false, //Seems to hide the title. 
}
/*
class App extends Component {
  render() {
    return (
      <div style={{ maxWidth: "100%" }}>
        <MaterialTable
                columns={ columns }
                data={ data }
                title="Demo Title"
                options = { options }
        />
      </div>
    );
  }
}
*/

ReactDOM.render(<MTable {...MTableOptions} />, document.getElementById("App"));

module.hot.accept();
