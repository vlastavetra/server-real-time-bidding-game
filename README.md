# Real Time Bidding Game

This game is an exciting real-time bidding platform where two users compete by placing bids within a set time limit. The challenge is to outbid your opponent by offering a higher price or greater quantity, all while racing against the clock.

**How to Play:**

1.  **Accessing the Game:**
    - Navigate to the game's website.
    - Log in or sign up to create a user account.
2.  **Starting a Bidding Match:**
    - Join a bidding match. You can start a new one or join an ongoing match.
    - Each match involves two players.
3.  **Placing Bids:**
    - Once the match starts, you will see an interface to submit your bid.
    - Enter your bid amount and submit before the timer runs out.
    - More bids! It’s not just the size that’s important, but also the quantity
4.  **Bidding Dynamics:**
    - Watch as bids from both players are updated in real-time.
5.  **Winning the Game:**
    - The winner is determined based on the highest bid in terms of price and quantity.
    - When the timer expires, the current highest bid wins the match.
6.  **Post-Match:**
    - The bid history, including prices, quantities, and the winner's details, are displayed.

**Features:**

- **User-Friendly Interface:** The game boasts a clean and intuitive React-based interface, making it easy to participate in matches.
- **Real-Time Updates:** Experience the thrill of live updates as bids from both users are displayed instantly.
- **Secure and Reliable:** Advanced error handling and validation ensure a secure and smooth gaming experience.

**Requirements for Playing:**

- A stable internet connection.
- Modern web browser.

### Video onboarding

[Link](https://www.loom.com/share/4d9f08bb9d46402b80d39f5a9b021739?sid=f62a1922-073a-43ee-9d4c-30affc01ea8b)

---

## How to run app

### Install packages

```bash
npm i
# or
yarn i
```

### Run app

```bash
npm run dev
# or
yarn run dev
```

## Backend Architecture Overview

#### **Core Libraries:**

- `express`: Facilitates the creation of server routes for handling client requests and responses.
- `bcrypt`: Ensures secure storage of user credentials by hashing passwords before they are saved in the database.
- `dotenv`: Manages environment variables, allowing the server to load different configurations depending on the development or production environment.
- `jsonwebtoken`: Provides authentication mechanisms by generating and verifying tokens that secure endpoints and sessions.
- `cors`: Enables cross-origin requests by setting up appropriate headers, essential for API communication between different domains.
- `ws`: Implements real-time, two-way communication between clients and server using the WebSocket protocol.
- `node-schedule`: Allows for scheduling tasks, such as checking for game end times and processing winners.
- `sqlite`, `sqlite3`: Act as a database layer to interact with the SQLite database, supporting data persistence for user information, game states, and bids.

#### **Architecture Components:**

- `controllers`: Handle the logic for incoming requests by interacting with the models and sending back responses to the client.
- `middleware`: Intercepts incoming requests to perform validations, authenticate users, and manage password hashing operations before they reach the controllers.
- `models`: Represent the data layer, interacting directly with the SQLite database to retrieve or modify data based on controller demands.
- `routes`: Define the endpoints and HTTP methods for the client-server interaction, wiring up middleware and controllers to specific paths.

#### **Authentication and Security:**

- Each route that requires user identification is protected using middleware functions that verify JSON Web Tokens sent in the authorization headers.
- Passwords are hashed using `bcrypt` to maintain the integrity and security of user credentials.

#### **WebSocket Interaction:**

- Real-time functionality is enabled through `ws`. When a client subscribes to a game, a WebSocket connection is established, and the client is added to a subscription list for that game.
- Bids placed are immediately broadcast to all subscribed clients, providing a live update to all participants.

#### **Database Interaction:**

- `sqlite` and `sqlite3` facilitate interaction with the database, which contains tables for `users`, `games`, `bids`, and `users_games`.
- A bid made during a game is logged in the `bids` table, and a scheduled task checks for finished games to determine the winner based on the quantity and value of bids.

#### **User Registration and Login:**

- Registration and login are handled by user-related controllers, which utilize middleware for data validation, user existence checks, and password hashing.
- Upon successful authentication, a token is generated and returned to the client, allowing the user to participate in the game sessions securely.

#### **Scheduled Tasks:**

- `node-schedule` is used to run periodic checks for games that have ended. The task then triggers the winner determination process based on the rules defined.

#### **Configuration and Environment:**

- Sensitive information such as database credentials and token secrets are stored in a `.env` file and accessed securely within the application.

The backend's well-defined structure ensures modularity, easy maintainability, and the ability to scale. The real-time aspect is a pivotal component of the gaming experience, making it engaging and dynamic. The secure handling of authentication and real-time updates via WebSockets are critical features that support the core functionality of the real-time bidding game.

## DB scheme

![](https://habrastorage.org/webt/wu/zn/q8/wuznq8yitnc2al-6ku8mwdwl1ji.png)
