import * as mysql from 'mysql2';
import * as dotenv from 'dotenv';
dotenv.config();

var conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conn.connect((err) => {
    if(err) throw err;
    console.log("Connected!");
});

export {conn};