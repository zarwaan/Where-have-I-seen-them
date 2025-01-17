import * as mysql from 'mysql2';
import * as dotenv from 'dotenv';
dotenv.config();

var conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

conn.connect((connectErr)=>{
    if(connectErr) throw connectErr;
    console.log('Connected!');
});

const dbCreationQuery = "CREATE DATABASE IF NOT EXISTS WhereHaveISeenThem";

conn.query(dbCreationQuery,(dbCreateError) => {
    if(dbCreateError) throw dbCreateError;
    console.log("Created!");
})

conn.end();