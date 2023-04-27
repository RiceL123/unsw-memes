# Iteration 4 Bonus Feature

The most unrealistic part of the assignment was storing all the data in a JSON file and continuously calling `fs.writeFileSync()` every time there was a change to database as it would require the entire file to be overwritten. As such, I deleted the `database.json` file and added a `unswmems.db` SQLite3 file with the `schema.sql`, `notifications.sql` and `stats.sql` loaded in.

Additionally, our groups code had previously used functions like `getData()` to parse the whole json object which required knowledge on the structure of the entire database. So, I decided to refactor every function that read directly from `database.json` and abstracted the querying logic with functions in the `database` directory which used SQL queries and the `better-sqlite3` npm package. In doing so, all the functions in `src` were made more reusable because if the database was ever changed to anything like PostgreSQL, MongoDB or Cassandra as only the files in the `database` directory would need to be refactored thanks to the abstraction.

The `schema.sql` was made as according to the ER diagram below which shows how the data is stored and can queried. The `notifications.sql` and `stats.sql` files have triggers on inserts, deletes and updates on tables to automatically update relevant information.

<img src="https://files.catbox.moe/pbzsk5.png">