## admin-portal
**Developed by MLZH Productions**

## Project Overview
This project will turn into a standalone Identity and Access Management (IAM) microservice and administrative dashboard, but for this assignment, we will act as the Admin and set up the Admin-Portal. It will provide a secure, scalable authentication regarding the Admin all while focusing on using REACT Implementation

## The Architecture Team (MLZH Productions)
* **[Teammate M]:** Cloud Database Architect & Overall Security (PostgreSQL, IAM, Backend Security)
* **[Teammate L]:** Frontend Engineer (React UI/UX)
* **[Teammate Z]:** Backend API Lead (Node.js/Express)
* **[Teammate H]:** Frontend Engineer (React Router & State Management)

## Technical Stack
* **Frontend:** React.js, React Router
* **Backend:** Node.js, Express
* **Database:** PostgreSQL
* **Security:** JWT (Session Management), bcrypt (Password Hashing)

## Local Development Setup (For groupmates)
1. Clone the repository: `git clone https://github.com/SH3EEESH/admin-portal.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Local DB setup
1. Create .env file in server folder
2. To run backend: `npm start`(seperate terminal)
3. To run frontend: `cd server /--> npm start` (seperate terminal)
4. Download PostsqreSQL --> create server (make sure server matches the following information)
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=(your own password)
JWT_SECRET=sentinel_jwt_secret_key_987654321

5. make sure you locally run the server and make sure your .env is inside the server folder in this project

   
