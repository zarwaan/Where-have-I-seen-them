import {conn} from './dbConnect.js';
import * as mysql from 'mysql2';
import * as dotenv from 'dotenv';
dotenv.config();

const addWatchlistdatetimeQuery = `ALTER TABLE users_watchlist ADD watched_datetime DATETIME DEFAULT CURRENT_TIMESTAMP`;

conn.query(addWatchlistdatetimeQuery,(err,result)=>{
    if(err) throw err;
    console.log("Added! ",result);
});

const playlistcreationtimequery = `ALTER TABLE users_playlist ADD modified_at DATETIME DEFAULT CURRENT_TIMESTAMP`;

conn.query(playlistcreationtimequery,(err,result)=>{
    if(err) throw err;
    console.log("Added! ",result);
});

const addedtoplaylisttimequery = `ALTER TABLE playlist_media ADD added_at DATETIME DEFAULT CURRENT_TIMESTAMP`;

conn.query(addedtoplaylisttimequery,(err,result)=>{
    if(err) throw err;
    console.log("Added! ",result);
});