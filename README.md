# GMS
GMS - gym mangement system is developed to cover all needs for effective gym management, it provides functionality for clients &amp; administrators to make the workflow more transparent, convenient, and efficient.

GMS Quick Start with Docker

Prerequisites:
Docker and Docker Compose installed
Ports 8080, 5432, 5672, 15672, 6379 available

Quick Start
Create .env file in the project root with required variables (database, Redis, RabbitMQ configs)

Build and start:
docker-compose up --build -d

Verify containers are running:
docker-compose ps

Access:
App: http://localhost:8080
API Docs: http://localhost:8080/swagger-ui.html
RabbitMQ: http://localhost:15672 (guest/guest)

Stop the application:
docker-compose down

Common Commands
View logs:
docker-compose logs -f

Full cleanup (including volumes):
docker-compose down -v

Rebuild after code changes:
docker-compose up --build -d
