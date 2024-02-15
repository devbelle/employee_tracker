const inquirer = require('inquirer');
const mysql = require('mysql2');
 //require('.env').config();
// //require('console.table');

// inquirer.prompt([
//   {
//     type:"input",
//     name:"full_name",
//     message:"what is your name"
//   }
// ]).then(res => console.log(res));

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // TODO: Add MySQL password here
    password: 'Shiningfinger#1', //process.env.DBPASSWORD,
    database: 'employee_db',
  },
  console.log(`Connected to the employee_tracker_db database.`)
);

db.connect((err)=> {
  if (err) throw err;
  console.log("Connected to the database.");
  start();
});


const questions = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "choices",
    choices: [
      "View All Employees",
      "Add Employee",
      "Update Employee Role",
      "View All Roles",
      "Add Role",
      "View All Departments",
      "Add Department"
    ]
  }
];

//inquirer.prompt(questions).then(res => console.log(res));
function start(){
  inquirer.prompt(questions).then((answer) => { 
      if (answer.choices === 'View All Employees') {
        console.log('View all employees.');
        viewAllEmployees();
      } else if (answer.choices === 'Add Employee') {
        console.log('Add a new employee.');
        addEmployee();
      } else if (answer.choices === 'Update Employee Role') {
        console.log('Update employee role.');
        updateEmployeeRole();
      } else if (answer.choices === 'View All Roles') {
        console.log('View all roles.');
        viewAllRoles();
      } else if (answer.choices === 'Add Role') {
        console.log('Add a new role.');
        addRole();
      } else if (answer.choices === 'View All Departments') {
        console.log('View all departments.');
        viewAllDepartments();
      } else if (answer.choices === 'Add Department') {
        console.log('Add a department.');
        addDepartment();
      } else {
        db.end();
        console.log("end")
      }
  })
  .catch(err => console.log(err));

}


function viewAllEmployees() {
  db.query(`SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name  
  FROM employees e
  JOIN roles r ON e.role_id = r.id
  JOIN departments d ON r.department_id = d.id
  JOIN employees m ON e.manager_id = m.id;`, (err, results) =>{
    if (err) {
      console.log(err);
      return;
    }
    console.table(results);
    start();
  });
};

function addEmployee() {
  db.query(`SELECT id, title FROM roles`, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }

    const roleChoices = results.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
    db.query(
      `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employees`,
      (error, results) => {
        if (error) {
          console.log(error);
          return;
        }

        const managerChoice = results.map(({id, name}) => ({
          name,
          value: id
        }));

        inquirer.prompt([
          {
            type: "input",
            name: "firstName",
            message: "Enter the employees's first name:"
          },
          {
            type: "input",
            name: "lastName",
            message: "Enter the employee's last name:"
          },
          {
            type: "list",
            name: "roleId",
            message: "Enter the employee's role",
            choices: roleChoices
          },
          {
            type: "list",
            name: "managerId",
            message: "Select the employee manager:",
            choices: [
              { name: "None", value: null },
              ...managerChoice,
            ],
          },
        ])
        .then((answers) => {
          const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`;

          const values = [
            answers.firstName,
            answers.lastName,
            answers.roleId,
            answers.managerId
          ];
          db.query(sql, values, (error) => {
            if (error) {
              console.log(error);
              return;
            }

            console.log("Employee added successfully");
            start();
          });
        })
        .catch((error) => {
          console.log(error);
        });
      }
    );
  });
}

// //update employee role

function updateEmployeeRole() {
  const queryEmployees = `SELECT employee.id, employee.first_name, employee.last_name, roles.title
  FROM employees JOIN roles ON employee.role_id = roles.id`;
  const queryRoles = `SELECT * FROM roles`;
  db.query(queryEmployees, (error, resEmployees) => {
    if (err) throw err;
    db.query(queryRoles, (err, resRoles) => {
      if (err) throw err;
      inquirer.prompt([
        {
          type: "list",
          name: "employee",
          message: "Choose the employee to update:",
          choices: resEmployees.map(
            (employee) =>
              `${employee.first_name} ${employee.last_name}`
          ),
        },
        {
          type: "list",
          name: "employee",
          message: "Choose the employee to update:",
          choices: resRoles.map((role) => role.title),
        },
      ])
      .then((answers) => {
        const employee = resEmployees.find(
          (employee) => `${employee.first_name} ${employee.last_name}` === answers.employee
        );
        const role = resRoles.find(
          (role) => role.title === answers.role
        );
        const update = `UPDATE employees SET role_id = ? WHERE id = ?`;
          db.query(
            update,
            [role.id, employee.id],
            (err, res) => {
              if (err) throw err;
              console.log(`Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in the database.`);
              start();
            }
          );
      });
    }); 
  });
}  

    
    
    

function viewAllRoles() {
  db.query("SELECT r.id, r.title, departments.department_name AS department, r.salary FROM roles r LEFT JOIN department ON r.department_id = department.id;" , (err, results) =>{
    if (err) {
      console.log(err);
      return;
    }
    console.table(results);
  });
}



function viewAllDepartments() {
  db.query(`SELECT * FROM departments`, (err, results) =>{
    if (err) {
      console.log(err);
      return;
    }
    console.table(results);
    start();
  });
}

function addDepartment () {
  inquirer.prompt({
    type: "input",
    name: "name",
    message: "Please type the name of the new department.",
  })
  .then((answer) => {
    console.log(answer.name);
    db.query(`INSERT INTO departments (department_name) Values ("${answer.name}")`, (err, res) => {
      if (err) throw err;
      console.log(`Added ${answer.name} department to the database.`);
      start();
      console.log(answer.name);
    });
  });
}

function addRole() {
  db.query(`SELECT * FROM departments`, (err, res) => {
    if (err) throw err;
    inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter name of new role.",
      },
      {
        type: "input",
        name: "salary",
        message: "Enter the salary of the new role.",
      },
      {
        type: "list",
        name: "department",
        message: "Choose the department the new role goes into.",
        choices: res.map((department) => department.department_name),
      },
    ])
    .then((answers) => {
      const newDepartment = res.find((department) => department.name === answers.department);
      const query = "INSERT INTO roles SET ?";
      db.query(
        query,
        {
          title: answers.title,
          salary: answers.salary,
          department_id: newDepartment,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database.`);
          start();
        }
      );
    });
  });
}

process.on("exit", () => {
  db.end();
});
