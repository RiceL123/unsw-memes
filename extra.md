# Iteration 4 Bonus Feature

The most unrealistic part of the assignment was storing all the data in a JSON file and continuously calling `fs.writeFileSync()` every time there was a change to database as it would require the entire file to be overwritten. As such, I deleted the `database.json` file and added a `unswmems.db` SQLite3 file with the `schema.sql`, `notifications.sql` and `stats.sql` loaded in. 

Additionally, our groups code had previously used functions like `getData()` to parse the entire database's which required knowledge on the structure of the entire database. So, I decided to removed every line of code which read from the database directly and abstracted them with functions in the `database` file which used SQL queries and the `better-sqlite3` npm package. In doing so, all the functions in `src` could be recycled if the database was ever changed to anything from PostgreSQL, MongoDB or Cassandra.

The `schema.sql` was made as according to the ER diagram below indicating how data is to be stored and queried. The `notifications.sql` and `stats.sql` files had triggers on inserts, deletes and updates on tables to automatically update corresponding information.

<img src="https://files.catbox.moe/pbzsk5.png">