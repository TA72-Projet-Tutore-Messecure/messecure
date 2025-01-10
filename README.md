# Messecure - Secure Web Messaging Application 🚀

Messecure is a modern, secure, and scalable web messaging application built using **Next.js 14**, powered by the **Matrix protocol** and **Synapse server**. It leverages the latest technology to ensure end-to-end encrypted communication, making it perfect for private and team-based messaging.

## ✨ Features
- Real-time messaging with **Matrix protocol** 🔄
- End-to-end encryption for secure conversations 🔐
- User-friendly web interface with dynamic UI components 🖥️
- Scalable infrastructure using Docker and Docker Compose 🐳

---

## 📦 Dependencies
### Core Technologies
- **Next.js 14**: A React-based framework for building fast and scalable web applications ⚡
- **Matrix Protocol**: An open standard for secure, decentralized communication 🔗
- **Synapse Server**: A homeserver implementation for the Matrix protocol 🏠

### Additional Dependencies
- **PostgreSQL 14**: Used as the database backend for the Synapse server 🗄️
- Various npm packages for UI components and utility functions (e.g., `matrix-js-sdk`, `next-auth`, `react-hook-form`)

---

## 🐳 Dockerization
Messecure is fully containerized using **Docker** and **Docker Compose** to simplify deployment and scaling. The application consists of three main services:
1. **Synapse**: The Matrix homeserver.
2. **PostgreSQL**: The database for Synapse.
3. **Messecure App**: The Next.js frontend application.

### Docker Compose Configuration
Below is the `docker-compose.yml` configuration:

```yaml
version: '3.8'

services:
  synapse:
    image: matrixdotorg/synapse:latest
    container_name: messecure-synapse
    depends_on:
      - postgres
    volumes:
      - ./synapse/homeserver.yaml:/data/homeserver.yaml
      - ./synapse/data:/data
    environment:
      SYNAPSE_SERVER_NAME: localhost
      SYNAPSE_REPORT_STATS: 'yes'
    ports:
      - "8008:8008"
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    container_name: messecure-db
    environment:
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD: aComplexPassphraseNobodyCanGuess
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  messecure:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: messecure-app
    ports:
      - "3000:3000"
    depends_on:
      - synapse
      - postgres
    environment:
      NODE_ENV: production
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
```

---

## 🛠️ Installation and Deployment

### Prerequisites
- Docker and Docker Compose installed on your system 🐳
- Node.js (v20 or higher) for local development 🌐

### Steps to Install and Run
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/messecure.git
   cd messecure
   ```

2. Configure Synapse:
    - Edit `synapse/homeserver.yaml` with your desired settings.

3. Build and run the Docker containers:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
    - Synapse Admin Interface: `http://localhost:8008`
    - Messecure Frontend: `http://localhost:3000`

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the application in development mode:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`.

---

## 🔐 Notes
- Replace sensitive environment variables with your own secure values.
- To deploy in production, use a reverse proxy like Nginx for SSL termination and domain setup.

---

Enjoy secure and modern communication with Messecure! ✉️🔒
