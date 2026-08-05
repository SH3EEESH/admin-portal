## admin-portal
**Developed by MLZH Productions**

## Project Overview
This project is the final result of our initial idea of an IAM. MLZH Productions implemented a working structrual hubs, implementing things on the End-user side, as well as the amdmin side. Each constains their own portals to view and interact with different ammedities. Security is built in, with extra smaller features we are excited to show off!

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

## Local Development Setup (For groupmates and users)
1. Clone the repository: `clone https://github.com/SH3EEESH/admin-portal.git`
2. Install dependencies: `npm install, npm cors`
3. Start the development server: `npm start`

## Local DB setup
1. Create .env file in server folder
2. To run frontend: `npm start`(seperate terminal)
3. To run backend: `cd server --> npm start` (seperate terminal)
4. Download PostsqreSQL --> create server (make sure server matches the following information)
**(.env) information (copy and paste):**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=(your own password)
JWT_SECRET=sentinel_jwt_secret_key_987654321
```

5. make sure you locally run the server and make sure your .env is inside the server folder within this project
   
## API Documentation
Base URL: http://localhost:5000/api

## Authentication Endpoints
1. POST /api/auth/register
Payload: { username, email, password }
Response: { message, token, user }
Description: Registers a new standard user account (role_id: 2).

2. POST /api/auth/login
Payload: { usernameOrEmail, password }
Response: { token, user }
Description: Authenticates credentials, generates a signed JWT token, and records LOGIN_SUCCESS or LOGIN_FAILED in Audit Logs.

3. POST /api/auth/reset-password
Payload: { usernameOrEmail, newPassword }
Response: { message }
Description: Hashes the new password with bcrypt, updates PostgreSQL, and records PASSWORD_RESET in Audit Logs.
User & Permission Management (Admin Only)

4. GET /api/users
Headers: Authorization: Bearer
Response: Array of all platform user objects.

5. PUT /api/users/:id/role
Headers: Authorization: Bearer
Payload: { role_id }
Description: Toggles user permission level between 1 (Admin) and 2 (User).
System Nodes & Telemetry (Admin Only)

6. GET /api/nodes
Response: List of connected infrastructure nodes (Database, Secondary Backup, Audit Logger, Edge Firewall).

7. DELETE /api/nodes/:id
Description: Decommissions a node from active monitoring.
Leaderboard & Game Endpoint

8. GET /api/leaderboard
Response: Returns top 5 non-admin user high scores ranked by score descending.

9. POST /api/leaderboard
Payload: { score, difficulty }
Description: Records a new high score run for standard user accounts.
Feedback Ingestion

10. GET /api/feedback
Description: Returns all submitted user feedbacks and bug reports.

11. POST /api/feedback
Payload: { message, type }
Description: Submits feedback from standard users.
Audit Logs (Admin Only)

12. GET /api/logs
Headers: Authorization: Bearer
Response: Returns system audit events including username, action type, timestamp, and resolved IPv4 address.


## User Roles + Workflows

**Admin Workflow (MLZH_admin)**
**Headquarters Dashboard:** View active system roles + monitor 4 infrastructure connected nodes (Primary Auth Database, Secondary Backup Node, Audit Logging Ingestion Server, Edge Security Firewall Node).
**Edit Permissions & Active Accounts:** Promote or demote any registered user account between Admin and User in real time.
**Audit Event Inspection:** Track all system actions, failed login attempts, password resets, and user IPv4 addresses.
**User Feedback Review:** Read feedback submissions sent by users.

**Standard User Workflow (User)**
**User Hub Portal:** View IAM profile summary and active user permissions.
**"Dinosaur" Sandbox Game:** Interactive obstacle game featuring difficulty selectors and score multipliers:
**Easy:** x0.25 score multiplier
**Normal / Medium:** x0.5 score multiplier
**Hard:** x1.0 score multiplier
**Live Global Leaderboard:** Displays top real-time scores achieved by standard user accounts. (Admin accounts are filtered out)
**Website Feedback Form:** Submit suggestions or bugs to the admin team.
**Simple Password Reset Flow:** Reset account password via the "Forgot Password?" option on the login card.

## Scope of AI Collaboration:
The AI used among this project was Claude, Gemini, and Google AntiGravity.
Created the "Dino" like google game for users to interact with.
Assisted in identifying state synchronization bugs, resolving duplicate CSS style key overwrites, and isolating keypress event listeners so typing spaces in textareas does not trigger game loops. Helped in implementing some API errors or bugs, and finalized overall control.
API & Database Resiliency: Assisted in writing SQL table auto-initialization queries (ALTER TABLE ADD COLUMN IF NOT EXISTS) and building fallback offline caching mechanisms for local state persistence. Helped debug any SQL syntax, and got rid of redundant language.
UI/UX Refinement: Helped polish layout alignments, dark mode aesthetics, dynamic status badges, and IPv4 address formatting in Audit Logs.

## Development Rules
Verify 'node_modules' is ignored before commiting any changes
Write concise and descriptive commit messages.

## Course Information
Course: COSC 3351 - Internet Programming

Semester: Summer 2026

Assignment: Project submission
