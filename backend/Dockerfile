FROM openjdk:17-jdk-slim

WORKDIR /app

# Install mysql client
RUN apt-get update && apt-get install -y default-mysql-client

# Copy app and wait script
COPY target/Ecomm-0.0.1-SNAPSHOT.jar app.jar
COPY backend/wait-for-mysql.sh wait-for-mysql.sh
RUN chmod +x wait-for-mysql.sh

ENTRYPOINT ["./wait-for-mysql.sh", "mysql-db", "java", "-jar", "app.jar"]
