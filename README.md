# SQL Driver Library

A lightweight, promise-based database driver library for Node.js, supporting MySQL and SQLite databases.

## Features

- Support for MySQL and SQLite databases
- Promise-based API for asynchronous operations
- Simple and intuitive API for creating and managing database connections
- Support for common database operations (CREATE, READ, UPDATE, DELETE)
- Built-in support for common data types (Text, Integer, BigInteger, Boolean, etc.)

## Installation

To install the library, run the following command:

```bash
npm install wave.sql
```

## Usage

```js
const { MySQLDriver, DataTypes, Clause, Order } = require("wave.sql");

// Create a new MySQL driver instance
const driver = new MySQLDriver({
    host: "localhost",
    user: "username",
    password: "password",
    database: "database",
});

// Create a new table
const table = "my_table";
const columns = [
    new TableColumn("id", DataTypes.Integer, true),
    new TableColumn("name", DataTypes.Text),
    new TableColumn("age", DataTypes.Integer),
    new TableColumn("email", DataTypes.Text),
];

driver.prepareTable(table, columns).then(() => {
  console.log("Table created successfully!");
});

// Insert a new row
const data = { name: "John Doe", age: 30, email: "john.doe@example.com" };
const clauses = [
    new Clause("name").equal("John Doe"),
    new Clause("age").greaterThan(25),
];
driver.setRows(table, data, clauses).then((rows) => {
    console.log("Row inserted successfully!");
});

// Retrieve all rows
const keys = ["id", "name", "age"];
const orderBy = [Order.Ascending("name"), Order.Descending("age")];
const limit = 10;
const offset = 5;
driver.getRows(table, keys, clauses, orderBy, false, limit, offset).then((rows) => {
    console.log(rows);
});

// Count rows
const column = "id";
const distinct = true;
driver.countRows(table, clauses, column, distinct).then((count) => {
    console.log(count);
});

// Delete rows
driver.deleteRows(table, clauses).then((affectedRows) => {
    console.log(affectedRows);
});
```

## Drivers

### MySQL Driver

```js
const { MySQLDriver } = require("wave.sql");

const sql = new MySQLDriver({
    host: "localhost",
    user: "username",
    password: "password",
    database: "database",
});
```

### Sqlite Driver


```js
const { SqliteDriver } = require("wave.sql");

const sql = new SqliteDriver("my_database.sqlite");
```

## API Documentation

### Classes

- `MySQLDriver`: A MySQL-specific driver class, extending the Driver class.
- `SqliteDriver`: A SQLite-specific driver class, extending the Driver class.
- `TableColumn`: A class representing a table column, with properties for column name, data type, and primary key status.
- `Clause`: A class representing a database query clause, with methods for building and executing queries.

### Methods

- `prepareTable(table, columns)`: Creates a new table with the specified columns.
- `dropTable(table)`: Drops the specified table.
- `getRows(table, keys, clauses, orderBy, first, limit, offset)`: Retrieves rows from the specified table, with optional filtering, sorting, and pagination.
- `countRows(table, clauses, column, distinct)`: Counts the number of rows in the specified table, with optional filtering and distinct counting.
- `setRows(table, data, clauses)`: Inserts or updates rows in the specified table, with optional filtering.
- `deleteRows(table, clauses)`: Deletes rows from the specified table, with optional filtering.

## Changelog

### v1.0.0 (2024-08-19)

- First public release of the library
- Support for MySQL and SQLite
- Basic functions for CRUD operations (Create, Read, Update, Delete)

### v1.0.1 (2024-08-19)

- Fix `Driver()`

### v1.0.3 (2024-08-19)

- Fix `prepareTable()`

### v1.0.4 (2024-08-19)

- Add `close()` in `MySQLDriver()` and `SqliteDriver()`

### v1.0.5 (2024-08-27)

- Fix `deleteRows()`
- Fix `query()` in `SqliteDriver()`