# Simple-MERN

This is a simple MERN (MongoDB, Express.js, React.js, Node.js) project. It includes the following features and technologies:

- **Backend**: Node.js with Express.js for building a RESTful API.
- **Frontend**: React.js with Tailwind CSS for a responsive and modern user interface.
- **Database**: MongoDB for data storage.
- **Authentication**: JSON Web Tokens (JWT) for secure user authentication.
- **Containerization**: Docker for seamless development and deployment.

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
