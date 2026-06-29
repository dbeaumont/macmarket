FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app
RUN echo '<settings/>' > /tmp/empty-settings.xml
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B -s /tmp/empty-settings.xml
COPY src ./src
RUN ./mvnw package -DskipTests -B -s /tmp/empty-settings.xml

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
