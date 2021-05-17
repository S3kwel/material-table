/***
 * FEATURES NEEDED:
 * 1. Table-wide validation
 * 2. Cross-table data comparison.
 * 3. Modals for error messages?
 *
 * */
import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialTable from "material-table";
import "../MTables.css";

class App extends Component {
  render() {
    return (
      <div style={{ maxWidth: "100%" }}>
        <MaterialTable
          columns={[
            { title: "Ad?", field: "name" },
            { title: "Soyad?", field: "surname" },
            { title: "Do?um Y?l?", field: "birthYear", type: "numeric" },
            {
              title: "Do?um Yeri",
              field: "birthCity",
              lookup: { 34: "?stanbul", 63: "?anl?urfa" },
            },
          ]}
          data={[
            {
              name: "Mehmet",
              surname: "Baran",
              birthYear: 1987,
              birthCity: 63,
            },
          ]}
          title="Demo Title"
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("App"));
