# Mini Banking System

A **mini banking system** built with a **microservices architecture**, fully containerized and running with **Docker**.

---

## System Startup

### Requirements

* Docker Desktop
* Docker Compose

### Step 1: Start all services

```bash
docker-compose up -d
```

### Step 2: Check service status

```bash
docker-compose ps
```

### Step 3: View logs (if needed)

```bash
docker-compose logs -f
```

---

## Application Access

* **Customer Web:** [http://localhost:3000](http://localhost:3000)
* **Admin Panel:** [http://localhost:3001](http://localhost:3001)
* **API Gateway:** [http://localhost:8080](http://localhost:8080)

---

## Test Accounts

| Role          | Email                                                           | Password         |
| ------------- | --------------------------------------------------------------- | ---------------- |
| Admin         | [admin@minibank.com](mailto:admin@minibank.com)                 | Admin@123        |
| Customer      | [test.user@example.com](mailto:test.user@example.com)           | TestPassword#123 |
| Staff         | [staff@minibank.com](mailto:staff@minibank.com)                 | Staff@123        |
| Counter Admin | [counter.admin@minibank.com](mailto:counter.admin@minibank.com) | CounterAdmin@123 |

---

## Stop the System

```bash
docker-compose down
```

---

## Troubleshooting

### Docker is not running

```bash
# Restart Docker Desktop
# Then run again:
docker-compose up -d
```

### Reset the entire system

```bash
docker-compose down -v
docker-compose up -d
```

---

## System Architecture

### Backend Services (Microservices)

* **API Gateway** (8080) – Entry point, routing and CORS handling
* **User Service** (8081) – User management and authentication
* **Account Service** (8082) – Bank account management
* **Transaction Service** (8083) – Transaction processing
* **Admin Service** (8084) – Administrative operations
* **Log Service** (8085) – System logging
* **Notification Service** (8086) – Notification delivery

---

### Frontend Applications

* **Customer Web** (3000) – Customer-facing application (React)
* **Admin Panel** (3001) – Administrative dashboard (React + Vite)

---

### Databases & Infrastructure

* **PostgreSQL** – One isolated database per service
* **Kafka + Zookeeper** – Asynchronous message queue

---

## Project Structure

```
mini-banking-system/
 api-gateway/
 services/
    user-service/
    account-service/
    transaction-service/
    admin-service/
    log-service/
    notification-service/
 frontend/
 banking-admin-hub-main/
 docker/
 scripts/
 documentation/
 docker-compose.yml
 README.md
```

---

## Features

### User Features

* Register and login
* Deposit funds (E-wallet, QR code, Counter)
* Withdraw funds (Counter, E-wallet)
* Money transfer
* Transaction history
* Profile management

---

### Admin Features

* User management (Lock/Unlock, Freeze/Unfreeze)
* Transaction counter management (CRUD)
* Staff management within counters (CRUD)
* System statistics and reports

---

### Staff Features

* Confirm counter deposit transactions
* View deposit request notifications

---

## References

*  [docker/README.md](docker/README.md) – Docker setup guide
* [scripts/README.md](scripts/README.md) – System management scripts

---

**Version:** 1.0
**Last Updated:** 2025-12-22

> **Tech Stack:** Java Spring Boot Microservices · React · PostgreSQL · Docker
