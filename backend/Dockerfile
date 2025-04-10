# Stage 1: Build
FROM maven:3.9.4-eclipse-temurin-17 as builder

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jdk

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd
RUN apt-get clean && rm -rf /var/lib/apt/lists/*


COPY --from=builder /app/target/*.jar app.jar
COPY backend/wait-for-mysql.sh wait-for-mysql.sh
RUN chmod +x wait-for-mysql.sh

ENTRYPOINT ["./wait-for-mysql.sh"]
CMD ["java", "-jar", "app.jar"]
