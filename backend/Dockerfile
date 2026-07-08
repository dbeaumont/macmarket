FROM eclipse-temurin:25-jdk-alpine AS build
ARG MAVEN_MIRROR_URL
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN apk add --no-cache openssl \
    && MIRROR_HOST=$(echo "${MAVEN_MIRROR_URL}" | sed 's|^https://||' | cut -d'/' -f1) \
    && openssl s_client -connect "${MIRROR_HOST}" -showcerts </dev/null 2>/dev/null \
       | awk '/-----BEGIN CERTIFICATE-----/{n++; f="/tmp/ca-"n".crt"} f{print > f} /-----END CERTIFICATE-----/{f=""}' \
    && for cert in /tmp/ca-*.crt; do \
         keytool -import -noprompt \
           -alias "jfrog-$(basename ${cert} .crt)" \
           -file "${cert}" \
           -keystore "${JAVA_HOME}/lib/security/cacerts" \
           -storepass changeit 2>/dev/null || true; \
       done \
    && chmod +x mvnw \
    && sed -i "s|\${env.MAVEN_MIRROR_URL}|${MAVEN_MIRROR_URL}|" .mvn/settings.xml \
    && ./mvnw dependency:go-offline -B -s .mvn/settings.xml
COPY src ./src
RUN ./mvnw package -DskipTests -B -s .mvn/settings.xml

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
