import {conn} from './dbConnect.js';
import * as mysql from 'mysql2';
import * as dotenv from 'dotenv';
dotenv.config();
 
const USERS_QUERY = `CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
)`;

const USERS_MEDIA_QUERY = `CREATE TABLE IF NOT EXISTS users_media (
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    media_type INT NOT NULL,
    watched_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id,media_id,media_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)`;

const USER_WATCHLIST_QUERY = `CREATE TABLE IF NOT EXISTS users_watchlist(
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    media_type INT NOT NULL,
    PRIMARY KEY (user_id,media_id,media_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)`;

const USERS_PLAYLIST_QUERY = `CREATE TABLE IF NOT EXISTS users_playlist(
    user_id INT NOT NULL,
    playlist_id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_name VARCHAR(255) NOT NULL,
    UNIQUE KEY (user_id,playlist_name),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)`;

const PLAYLIST_MEDIA_QUERY = `CREATE TABLE IF NOT EXISTS playlist_media(
    playlist_id INT NOT NULL,
    media_id INT NOT NULL,
    media_type INT NOT NULL,
    PRIMARY KEY (playlist_id,media_id,media_type),
    FOREIGN KEY (playlist_id) REFERENCES users_playlist(playlist_id) ON DELETE CASCADE
)`;

// 1 FOR MOVIE 2 FOR TV

conn.query(USERS_QUERY,(err,result)=>{
    if(err) throw err;
    console.log("Created table users! ",result);
});

conn.query(USERS_MEDIA_QUERY,(err,result) => {
    if(err) throw err;
    console.log("Created table users_media! ",result);
});

conn.query(USER_WATCHLIST_QUERY,(err,result) => {
    if(err) throw err;
    console.log("Created table users_watchlist! ",result);
});

conn.query(USERS_PLAYLIST_QUERY,(err,result) => {
    if(err) throw err;
    console.log("Created table users_playlist! ",result);
});

conn.query(PLAYLIST_MEDIA_QUERY,(err,result) => {
    if(err) throw err;
    console.log("Created table playlist_media! ",result);
});

conn.end();