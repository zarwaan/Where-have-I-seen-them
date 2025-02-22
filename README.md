# Where Have I Seen Them?

A web application that allows users to search for movies, TV shows, and actors while providing personalized features such as logging watched content, creating playlists, and maintaining a watchlist. It is built with HTML, CSS, and vanilla JavaScript on the frontend and utilizes Node.js with Express for the backend. It also integrates MySQL for database management and TMDB as a media database.

## Features
- **Search for movies and TV shows**
- **Log watched movies and TV shows**
- **Search for actors**
- **Find common movies and TV shows for 2-4 actors**
- **Identify who played a character in a movie or TV show**
- **Filter results based on logged movies and TV shows (requires sign-in)**
- **Add movies to your watchlist**
- **Create custom playlists**

## Technologies Used
- **Frontend:** HTML, CSS, Vanilla JavaScript, Bootstrap CSS
- **Backend:** Node.js, Express
- **Database:** MySQL, mysql2 library
- **Authentication & Security:** bcrypt for password hashing, cookie-parser for server-side cookies, js-cookie for client-side cookies
- **Media Database:** [TMDB](https://www.themoviedb.org/) (The Movie Database) for movies, TV shows, images, actors, casts, crew and all film and TV related information
- **Utilizes the TMDB API for fetching movie, TV show, and actor information. This project uses the TMDB API but is not endorsed or certified by TMDB.**
- **Deployment:** Hosted on Railway (Free Tier) - [Live Demo](https://wherehaveiseenthem.up.railway.app)

## Installation & Running Locally

### Prerequisites
Ensure the following are installed on your system:
1. [Node.js](https://nodejs.org/)
2. [MySQL](https://dev.mysql.com/downloads/installer/)
3. [MySQL Workbench (optional)](https://dev.mysql.com/downloads/workbench/)

### Steps to Run Locally
1. Clone the Git repository or download the source code:
   ```sh
   git clone <repository-url>
   cd <project-directory>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. [Create a MySQL Connection Instance](https://dev.mysql.com/doc/mysql-getting-started/en/)
4. Create a `.env` file and update necessary environment variables.
5. Initialize the database:
   ```sh
   node db/dbCreate.js
   node db/dbSchema.js
   node db/editDbSchema.js
   ```
6. Start the server:
   ```sh
   node src/app.js
   ```
7. Open your browser and navigate to [https://localhost:3000](https://localhost:3000).
