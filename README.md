# Simple-MERN

This is a simple MERN (MongoDB, Express.js, React.js, Node.js) project. It includes the following features and technologies:

- **Backend**: Node.js with Express.js for building a RESTful API.
- **Frontend**: React.js with Tailwind CSS for a responsive and modern user interface.
- **Database**: MongoDB for data storage.
- **Authentication**: JSON Web Tokens (JWT) for secure user authentication, access token in the state of the site and refresh token in a HttpOnly token.
- **Containerization**: Docker for seamless development and deployment.

## Live demo

https://drive.google.com/file/d/1ZZi03g8ZmGx68mcOjz0qNUjJfudqo2N0/view?usp=sharing

## Getting Started

There are two ways to set up and run the project locally one with Docker (Recommended) and one without it:

## With Docker

### Prerequisites

Ensure you have the following installed on your system:

- [Docker](https://www.docker.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Simple-MERN.git
   cd Simple-MERN
   ```

### Running the Project on development mode

1. Build and start the Docker containers:

   ```bash
   docker-compose up --build
   ```

   > ✅ **Note**  
   > A default user will be created for testing purposes:
   >
   > - **Email:** `user@example.com`
   > - **Password:** `P@ssw0rd`

2. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

### Running the Project on production mode

1. Build and start the Docker containers:

   ```bash
   docker-compose -f docker-compose.prod.yaml up --build
   ```

   > ✅ **Note**  
   > A default user will be created for testing purposes:
   >
   > - **Email:** `user@example.com`
   > - **Password:** `P@ssw0rd`

2. Access the application:

   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:3000`

### Running the tests

1. Build and start the Docker containers:

   ```bash
   docker-compose -f docker-compose.test.yaml up --build
   ```

## Without Docker

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Simple-MERN.git
   cd Simple-MERN
   ```

   > ✅ **Note**  
   > To create a default user for testing purposes, run the following command:

   ```bash
   mongo mongodb://localhost:27017/admin mongo-init.js
   ```

   > Then use the following credentials to log in:
   >
   > - **Email:** `user@example.com`
   > - **Password:** `P@ssw0rd`

### Running the Project on development mode

1. Build and start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Return to the root:

   ```bash
    cd ..
   ```

3. Build and start the frontend:

   ```bash
   cd frontend/simple-mern-frontend
   npm install
   npm run dev
   ```

4. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

### Running the Project on production mode

1. Build and start the backend:

   ```bash
   cd backend
   npm install
   npm run build
   npm run start
   ```

2. Return to the root:

   ```bash
    cd ..
   ```

3. Build and start the frontend:

   ```bash
   cd frontend/simple-mern-frontend
   npm install
   npm run build:prod
   npm run preview
   ```

4. Access the application:

   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

### Running the tests

1. Build and start the backend:

   ```bash
   cd backend
   npm install
   npm run test
   ```

2. Return to the root:

   ```bash
    cd ..
   ```

3. Build and start the frontend:

   ```bash
   cd frontend/simple-mern-frontend
   npm install
   npm run test
   ```

## Technology

### Node.js with Express.js

I used Express.js as it offers a set of features which makes creating APIs easy and flexible, as it supports middlewares which can be used for handling a lot of stuff like authentication and authorization.

### JWT

I used JWt as it is easy to implement and it is stateless and they are small in size, i used access token and refresh token, the access token is sent in the response body to the frontend, to be used in its requests and it have a short life, while the refresh token is sent to the frontend as a HttpOnly cookie, to be used to ask for a new access token when the old one's life ends and it have a long life, the refresh token gets blacklisted in the database after logout.

### React.js

I used React as it is a great library which makes frontend development easier and faster, because of its JSX syntax
and component based architecture, which makes it easier to maintain and scale and it have big support community, tools, libraries, and documentation, and also it offers Seamless integration with tools like Zustand, React Router, Tailwind.

### Zustand

I used Zustand for state management as it is so easy to setup and use.

### MongoDB

I used MongoDB as it is super easy to setup and start working with it, and this project is small with no relations as it only have users and blacklist for the refresh tokens so a noSQL database was the best option.

## Assumptions

The API Registration endpoint takes password and confirm password for an added layer of validation even though in this project we handle it in the frontend but i think the API should validate all data.
