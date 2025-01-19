import * as dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import {conn} from '../db/dbConnect.js';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(cookieParser());
dotenv.config();

app.use('/static',express.static(path.join(__dirname,'../static')));

function authorizeUser(req,res,next) {
    const {username} = req.params;
    if(!(req.cookies.userInfo) || username!== JSON.parse(req.cookies.userInfo).username)
        return res.status(401).sendFile(path.join(__dirname, '../templates/unathorised.html'));
    next();
}

function authorizeAdmin(req,res,next) {
    if(!(req.cookies.userInfo) || JSON.parse(req.cookies.userInfo).username !== 'admin')
        return res.status(401).sendFile(path.join(__dirname, '../templates/unathorised.html'));
    next();
}

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'../templates/index.html'));
});
app.get('/media', (req, res) => {
    res.sendFile(path.join(__dirname, '../templates/main.html'));
});
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '../templates/signin.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../templates/signup.html'));
});
app.get('/profile', (req,res) => {
    res.sendFile(path.join(__dirname, '../templates/profile.html'));
});
app.get('/actor-group', (req,res) => {
    res.sendFile(path.join(__dirname, '../templates/searchtwo.html'));
});
app.get('/users/:username/changepassword',authorizeUser, (req,res) => {
    res.sendFile(path.join(__dirname, '../templates/changePassword.html'));
});
app.get('/favicon.ico', (req,res) => {
    res.sendFile(path.join(__dirname, '../static/images/favicon.ico'));
});
app.get('/users/:username',authorizeUser,(req,res) => {
    res.sendFile(path.join(__dirname, '../templates/profile.html'));
});
app.get('/users/:username/playlists/:playlistName',authorizeUser,(req,res) => {
    const {username, playlistName} = req.params;
    if(playlistName === 'Watchlist')
        res.sendFile(path.join(__dirname, '../templates/watchlist.html'));
    else
        res.sendFile(path.join(__dirname, '../templates/playlist.html'));
});
app.get('/users/:username/playlists',authorizeUser,(req,res) => {
    res.sendFile(path.join(__dirname, '../templates/playlists.html'));
});
app.get('/movie/:mediaIdentifier',(req,res) => {
    res.sendFile(path.join(__dirname, '../templates/main.html'));
});
app.get('/tv/:mediaIdentifier',(req,res) => {
    res.sendFile(path.join(__dirname, '../templates/main.html'));
});
app.get('/actor/:actorIdentifier',(req,res) => {
    res.sendFile(path.join(__dirname, '../templates/search.html'));
});
app.get('/actor',(req,res) => {
    res.sendFile(path.join(__dirname, '../templates/search.html'));
});

const MY_API_KEY = process.env.API_KEY;
const MY_BEARER_TOKEN = process.env.BEARER_TOKEN;
const SECRET_KEY = process.env.SECRET_KEY;

const loginQuery = 'SELECT * FROM users WHERE username=?';
const registerQuery = 'INSERT INTO users(username,first_name,last_name,password) values(?,?,?,?)';
const deleteQuery = 'DELETE FROM users WHERE username=?';
const logMediaQuery = 'INSERT INTO users_media(user_id, media_id, media_type) values(?,?,?)';
const unlogMediaQuery = 'DELETE FROM users_media WHERE user_id = ? AND media_id = ? AND media_type = ?';
const watchStatusQuery = 'SELECT 1 FROM users_media WHERE user_id = ? AND media_id = ? AND media_type = ? LIMIT 1';
const userDetailsQuery = 'SELECT username,first_name,last_name FROM users where user_id = ?';
const updateDetailsQuery = 'UPDATE users SET username=?, first_name=?, last_name=? WHERE user_id=?';
const watchedMediaQuery = 'SELECT media_id,media_type FROM users_media WHERE user_id = ? ORDER BY watched_datetime DESC';
const changePasswordQuery = 'UPDATE users SET password=? WHERE username=?';
const addToWatchlistQuery = 'INSERT INTO users_watchlist(user_id, media_id, media_type) values(?,?,?)';
const checkInWatchlistQuery = 'SELECT 1 FROM users_watchlist WHERE user_id = ? AND media_id = ? AND media_type = ? LIMIT 1';
const getWatchlistQuery = 'SELECT media_id,media_type FROM users_watchlist WHERE user_id = ? ORDER BY watched_datetime DESC';
const removeFromWatchlistQuery = 'DELETE FROM users_watchlist WHERE user_id = ? AND media_id = ? AND media_type = ?';
const createPlaylistQuery = 'INSERT INTO users_playlist(user_id,playlist_name) values(?,?)';
const allPlaylistsQuery = 'SELECT * FROM users_playlist WHERE user_id = ? ORDER BY modified_at DESC';
const playlistMediaQuery = 'SELECT media_id,media_type FROM playlist_media WHERE playlist_id = ? ORDER BY added_at DESC'; 
const getPlaylistIdQuery = 'SELECT playlist_id FROM users_playlist WHERE user_id = ? AND playlist_name = ?';
const changePlaylistNameQuery = 'UPDATE users_playlist SET playlist_name = ? WHERE playlist_id = ?';
const checkInPlaylistQuery = 'SELECT 1 FROM playlist_media WHERE playlist_id = ? AND media_id = ? AND media_type = ? LIMIT 1'
const addToPlaylistQuery = 'INSERT INTO playlist_media(playlist_id, media_id, media_type) values(?,?,?)';
const updateTimeOfPlaylistQuery = 'UPDATE users_playlist SET modified_at = CURRENT_TIMESTAMP WHERE playlist_id = ?';
const removeFromPlaylistQuery = 'DELETE FROM playlist_media WHERE playlist_id = ? AND media_id = ? AND media_type = ?'; 
const removePlaylistQuery = 'DELETE FROM users_playlist WHERE playlist_id = ?';

app.get('/api-key', (req,res) => {
    res.json({api_key: MY_API_KEY,bearer_token:MY_BEARER_TOKEN});
});

app.post('/login',(HTTPreq,HTTPres) => {
    const {username, password} = HTTPreq.body;
    if(username === '' || password === ''){
        return HTTPres.status(401).json({message:"Please enter username and password!", details:null, type: "ERR_INVALID_CREDENTIALS"});
    }
    conn.query(loginQuery,[username],async (err,result)=>{
        if(err){
            console.log(err);
            return HTTPres.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        if(result.length === 0){
            return HTTPres.status(401).json({message:"No such username exists!", details:err, type: "ERR_INVALID_CREDENTIALS"});
        }
        if(await bcrypt.compare(password,result[0]['password'])){
            const {user_id , username} = result[0];
            const userCreds = {user_id: user_id, username: username};
            // const token = jwt.sign(userCreds,SECRET_KEY);
            // return HTTPres.status(200).json(token);

            // THIS IS NEW
            // HTTPres.cookie('authToken',token,{
            //     httpOnly: true,
            //     secure: false,
            //     sameSite: 'strict'
            // });
            // THIS IS NEW

            HTTPres.cookie('userInfo',JSON.stringify(userCreds),{
                httpOnly: false,
                secure: false,  
                sameSite: 'strict', 
                maxAge: 24 * 60 * 60 * 1000 * 7
            });

            return HTTPres.status(200).json({message: "Logged In Succesfully"});
        }
        else
            return HTTPres.status(401).json({message:"Incorrect password!", details:err, type: "ERR_INVALID_CREDENTIALS"});
    });
});

app.get('/user-details',(HTTPreq,HTTPres) => { 
    const userInfo = HTTPreq.cookies.userInfo;
    if(!userInfo){
        return HTTPres.status(401).json({message: 'User not logged in.'});
    }
    const user = JSON.parse(userInfo);
    const userId = user.user_id;
    conn.query(userDetailsQuery,[userId],(err,result) => {
        if(err){
            return HTTPres.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        return HTTPres.status(200).json({message:"Retrieved successfully", results: result});
    });
});

app.post('/register',async (httpReq,httpRes) => {
    const {username, password, firstName, lastName} = httpReq.body;
    if(username==='' || password==='' || firstName===''){
        return httpRes.status(400).json({message:"Please fill all required fields!", details:null, type: "ERR_EMPTY_CREDENTIALS"});
    }
    //USE REGEX TO CHECK IF USERNAME DOESNT HAVE SPECIAL CHARACTERS 
    if(!/^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/.test(username)){
        if(username.length < 3){
            return httpRes.status(400).json({message:"Username must be more than 3 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
        }
        else if(username.length >20){
            return httpRes.status(400).json({message:"Username must be less than 20 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
        }
        else{
            return httpRes.status(400).json({message:"Username must contain atleast one letter and may contain only letters, numbers, hyphens and underscores!", details:null, type: "ERR_INVALID_CREDENTIALS"});
        }
    }
    if(!/^[a-zA-Z]+[-']{0,1}[a-zA-Z]*[a-zA-z]+$/.test(firstName) || (lastName && !/^[a-zA-Z]+[-']{0,1}[a-zA-Z]*[a-zA-z]+$/.test(lastName))){
        return httpRes.status(400).json({message:"Names must begin and end with letters and may contain one single quote or hyphen!", details:null, type: "ERR_INVALID_CREDENTIALS"});
    }
    const hashedPassword = await bcrypt.hash(password,10);
    conn.query(registerQuery,[username, firstName, lastName, hashedPassword],(err,result)=>{
        if(err){
            if(err.code === 'ER_DUP_ENTRY'){
                return httpRes.status(400).json({message:"Username already exists!", details:null, type: "ERR_DUPLICATE_CREDENTIALS"});
            }
            if(err.code === 'ER_DATA_TOO_LONG'){
                return httpRes.status(400).json({message:"Input fields are too long!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
            else{
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
        }
        const user_id = result.insertId;
        const userCreds = {user_id: user_id, username: username};
        httpRes.cookie('userInfo',JSON.stringify(userCreds),{
            httpOnly: false,
            secure: false,
            sameSite: 'strict', 
            maxAge: 24 * 60 * 60 * 1000 * 7
        });
        return httpRes.status(200).json({message: "Signed up and Logged In Succesfully"});
    });
});

app.get('/logout', (httpReq, httpRes) => {
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        httpRes.clearCookie('userInfo');
        return httpRes.status(200).json({message: "Logged out successfully"});
    }
    else
        return httpRes.status(401).json({message: "User is not logged in"});
});

app.get('/delete', (httpReq, httpRes) => {
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        httpRes.clearCookie('userInfo');
        const user = JSON.parse(userInfoCookie);
        const username = user.username;
        conn.query(deleteQuery,[username],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message:"Deleted Succesfully!"}); 
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/log-media', (httpReq, httpRes) => {
    const {mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(logMediaQuery,[userId,mediaId,mediaType],(err,result) => {
            if(err){
                console.log(err);
                if(err.code==="ER_DUP_ENTRY")
                    return httpRes.status(400).json({message:"Movie already logged", details:err, type:"ERR_DUPLICATE_LOG"});
                else
                    return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Inserted Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/unlog-media',(httpReq, httpRes) => {
    const {mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(unlogMediaQuery,[userId,mediaId,mediaType],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Deleted Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/get-watch-status', (httpReq, httpRes) => {
    const {mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(watchStatusQuery,[userId,mediaId,mediaType],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Retrieved", watched: result.length > 0});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/update-user-details',(httpReq,httpRes) => {
    const {username, firstName, lastName} = httpReq.body;
    const userInfo = httpReq.cookies.userInfo;
    if(!userInfo){
        return httpRes.status(401).json({message: 'User not logged in.'});
    }
    const user = JSON.parse(userInfo);
    const userId = user.user_id;
    if(username==='' || firstName===''){
        return httpRes.status(400).json({message:"Please fill all required fields!", details:null, type: "ERR_EMPTY_CREDENTIALS"});
    }
    if(!/^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/.test(username)){
        if(username.length < 3){
            return httpRes.status(400).json({message:"Username must be more than 3 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
        }
        else if(username.length >20){
            return httpRes.status(400).json({message:"Username must be less than 20 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
        }
        else{
            return httpRes.status(400).json({message:"Username must contain atleast one letter and may contain only letters, numbers, hyphens and underscores!", details:null, type: "ERR_INVALID_CREDENTIALS"});
        }
    }
    if(!/^[a-zA-Z]+[-']{0,1}[a-zA-Z]*[a-zA-z]+$/.test(firstName) || (lastName && !/^[a-zA-Z]+[-']{0,1}[a-zA-Z]*[a-zA-z]+$/.test(lastName))){
        return httpRes.status(400).json({message:"Names must begin and end with letters and may contain one single quote or hyphen!", details:null, type: "ERR_INVALID_CREDENTIALS"});
    }
    conn.query(updateDetailsQuery,[username, firstName, lastName, userId],(err,result)=>{
        if(err){
            if(err.code === 'ER_DUP_ENTRY'){
                return httpRes.status(400).json({message:"Username already exists!", details:null, type: "ERR_DUPLICATE_CREDENTIALS"});
            }
            if(err.code === 'ER_DATA_TOO_LONG'){
                return httpRes.status(400).json({message:"Input fields are too long!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
            else{
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
        }
        const userCreds = {user_id: userId, username: username};
        httpRes.cookie('userInfo',JSON.stringify(userCreds),{
            httpOnly: false,
            secure: false,
            sameSite: 'strict', 
            maxAge: 24 * 60 * 60 * 1000 * 7
        });
        return httpRes.status(200).json({message: "Details Updated Successfully!"});
    });
});

app.get('/watched-media',(httpReq,httpRes) => {
    const userInfo = httpReq.cookies.userInfo;
    if(!userInfo){
        return httpRes.status(401).json({message: 'User not logged in.'});
    }
    const user = JSON.parse(userInfo);
    const userId = user.user_id;
    conn.query(watchedMediaQuery,[userId],(err,result) => {
        if(err){
            return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        if(result.length === 0){
            return httpRes.status(200).json({message:"Retrieved Successfully", number_of_movies: 0, media: []});
        }
        return httpRes.status(200).json({message:"Retrieved Successfully", number_of_movies: result.length, media: result});
    });
});

app.post('/new-password',(httpReq,httpRes) => {
    const userInfo = httpReq.cookies.userInfo;
    if(!userInfo){
        return httpRes.status(401).json({message: 'User not logged in.'});
    }
    const user = JSON.parse(userInfo);
    const username = user.username;
    const {password, newPassword} = httpReq.body;
    if(newPassword === '' || password === ''){
        return httpRes.status(401).json({message:"Please fill all fields!", details:null, type: "ERR_INVALID_CREDENTIALS"});
    }
    conn.query(loginQuery,[username],async (err,result)=>{
        if(err){
            return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        if(result.length === 0){
            return httpRes.status(401).json({message:"No such username exists!", details:err, type: "ERR_INVALID_CREDENTIALS"});
        }
        if(await bcrypt.compare(password,result[0]['password'])){
            const hashedPassword = await bcrypt.hash(newPassword,10);  
            conn.query(changePasswordQuery,[hashedPassword,username],(changePassErr,changePassResult) => {
                if(changePassErr){
                    return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
                }
                return httpRes.status(200).json({message: "Changed password successfully!"});
            });            
        }
        else
            return httpRes.status(401).json({message:"Incorrect password!", details:err, type: "ERR_INVALID_CREDENTIALS"});
    });
});

app.post('/add-to-watchlist',(httpReq,httpRes) => {
    const {mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(addToWatchlistQuery,[userId,mediaId,mediaType],(err,result) => {
            if(err){
                console.log(err);
                if(err.code==="ER_DUP_ENTRY")
                    return httpRes.status(400).json({message:"Media already in watchlist!", details:err, type:"ERR_DUPLICATE_LOG"});
                else
                    return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Added Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/check-in-watchlist',(httpReq,httpRes) => {
    const {mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(checkInWatchlistQuery,[userId,mediaId,mediaType],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Retrieved", inWatchlist: result.length > 0});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.get('/get-watchlist',(httpReq,httpRes) => {
    const userInfo = httpReq.cookies.userInfo;
    if(!userInfo){
        return httpRes.status(401).json({message: 'User not logged in.'});
    }
    const user = JSON.parse(userInfo);
    const userId = user.user_id;
    conn.query(getWatchlistQuery,[userId],(err,result) => {
        if(err){
            return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        if(result.length === 0){
            return httpRes.status(200).json({message:"Retrieved Successfully", number_of_movies: 0, media: []});
        }
        return httpRes.status(200).json({message:"Retrieved Successfully", number_of_movies: result.length, media: result});
    });
});

app.post('/remove-from-watchlist',(httpReq, httpRes) => {
    const {mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(removeFromWatchlistQuery,[userId,mediaId,mediaType],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Removed Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/create-playlist',(httpReq,httpRes) => {
    let {playlistName} = httpReq.body;
    playlistName = playlistName.trim();
    if(playlistName.toLowerCase() === 'watchlist') 
        return httpRes.status(400).json({message:"Playlist name cannot be watchlist!", details:null, type:"ERR_DUPLICATE_LOG"});
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        if(!/^[a-zA-Z0-9 ]{3,255}$/.test(playlistName)){
            if(playlistName.length < 3){
                return httpRes.status(400).json({message:"Playlist name must be at least 3 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
            else if(playlistName.length > 255){
                return httpRes.status(400).json({message:"PLaylist name must be less than 255 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
            else{
                return httpRes.status(400).json({message:"Playlist name can only contain letters and numbers!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
        }
        conn.query(createPlaylistQuery,[userId,playlistName],(err,result) => {
            if(err){
                if(err.code==="ER_DUP_ENTRY")
                    return httpRes.status(400).json({message:"A playlist by that name already exists!", details:err, type:"ERR_DUPLICATE_LOG"});
                else
                    return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Added Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.get('/all-playlists',(httpReq,httpRes) => {
    const userInfo = httpReq.cookies.userInfo;
    if(!userInfo){
        return httpRes.status(401).json({message: 'User not logged in.'});
    }
    const user = JSON.parse(userInfo);
    const userId = user.user_id;
    conn.query(allPlaylistsQuery,[userId],(err,result) => {
        if(err){
            return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        if(result.length === 0){
            return httpRes.status(200).json({message:"Retrieved Successfully", number_of_playlists: 0, playlists: []});
        }
        return httpRes.status(200).json({message:"Retrieved Successfully", number_of_playlists: result.length, playlists: result});
    });
});

app.post('/get-playlist-media',(httpReq,httpRes) => {
    const {playlistId} = httpReq.body;
    conn.query(playlistMediaQuery,[playlistId],(err,result) => {
        if(err){
            return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        if(result.length === 0){
            return httpRes.status(200).json({message:"Retrieved Successfully", number_of_media: 0, media: []});
        }
        return httpRes.status(200).json({message:"Retrieved Successfully", number_of_media: result.length, media: result});
    });
});

app.post('/get-playlist-id', (httpReq,httpRes) => {
    const {playlistName} = httpReq.body;
    const userInfo = httpReq.cookies.userInfo;
    if(!userInfo){
        return httpRes.status(401).json({message: 'User not logged in.'});
    }
    const user = JSON.parse(userInfo);
    const userId = user.user_id;
    conn.query(getPlaylistIdQuery,[userId,playlistName],(err,result) => {
        if(err){
            return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
        }
        if(result.length === 0){
            return httpRes.status(400).json({message:"No such playist!", playlistId: null});
        }
        return httpRes.status(200).json({message:"Retrieved Successfully",playlistId: result[0]['playlist_id']});
    });
});

app.post('/change-playlist-name',(httpReq,httpRes) => {
    let {playlistId,playlistName} = httpReq.body;
    playlistName = playlistName.trim();
    if(playlistName.toLowerCase() === 'watchlist') 
        return httpRes.status(400).json({message:"Playlist name cannot be watchlist!", details:null, type:"ERR_DUPLICATE_LOG"});
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        if(!/^[a-zA-Z0-9 ]{3,255}$/.test(playlistName)){
            if(playlistName.length < 3){
                return httpRes.status(400).json({message:"Playlist name must be at least 3 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
            else if(playlistName.length > 255){
                return httpRes.status(400).json({message:"PLaylist name must be less than 255 characters!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
            else{
                return httpRes.status(400).json({message:"Playlist name can only contain letters and numbers!", details:null, type: "ERR_INVALID_CREDENTIALS"});
            }
        }
        conn.query(changePlaylistNameQuery,[playlistName,playlistId],(err,result) => {
            if(err){
                console.log(err);
                if(err.code==="ER_DUP_ENTRY")
                    return httpRes.status(400).json({message:"A playlist by that name already exists!", details:err, type:"ERR_DUPLICATE_LOG"});
                else
                    return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Changed Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/check-in-playlist',(httpReq,httpRes) => {
    const {playlistId,mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(checkInPlaylistQuery,[playlistId,mediaId,mediaType],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Retrieved", inPlaylist: result.length > 0});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/add-to-playlist',(httpReq,httpRes) => {
    const {playlistId,mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(addToPlaylistQuery,[playlistId,mediaId,mediaType],(err,result) => {
            if(err){
                console.log(err);
                if(err.code==="ER_DUP_ENTRY")
                    return httpRes.status(400).json({message:"Media already in watchlist!", details:err, type:"ERR_DUPLICATE_LOG"});
                else
                    return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            conn.query(updateTimeOfPlaylistQuery,[playlistId],(err2,result2) => {
                if(err2) console.log(err2);
                else {}
            });
            return httpRes.status(200).json({message: "Added Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/remove-from-playlist',(httpReq, httpRes) => {
    const {playlistId,mediaId,mediaType} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(removeFromPlaylistQuery,[playlistId,mediaId,mediaType],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            conn.query(updateTimeOfPlaylistQuery,[playlistId],(err2,result2) => {
                if(err2) console.log(err2);
                else {}
            });
            return httpRes.status(200).json({message: "Removed Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.post('/remove-playlist',(httpReq, httpRes) => {
    const {playlistId} = httpReq.body;
    const userInfoCookie = httpReq.cookies.userInfo;
    if(userInfoCookie){
        const user = JSON.parse(userInfoCookie);
        const userId = user.user_id;
        conn.query(removePlaylistQuery,[playlistId],(err,result) => {
            if(err){
                return httpRes.status(500).json({message:"Internal Server Error", details:err, type:"ERR_INTERNAL"});
            }
            return httpRes.status(200).json({message: "Removed Successfully!"});
        });
    }
    else{
        return httpRes.status(401).json({message:"User not logged in!"});
    }
});

app.use((req,res) => {
    res.sendFile(path.join(__dirname, '../templates/404.html'));
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));