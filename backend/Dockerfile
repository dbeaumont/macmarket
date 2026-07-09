# ─────────────────────────────────────────────────────────────────────────────
# Étape 1 — Build : compilation Maven avec JDK 25 (Alpine)
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk-alpine AS build

# URL du miroir Maven interne (ex : Artifactory/JFrog), passée au build Docker
ARG MAVEN_MIRROR_URL

WORKDIR /app

# Copier les descripteurs de build avant les sources pour profiter du cache Docker
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# 1. Installer openssl (nécessaire pour extraire le certificat TLS du miroir Maven)
# 2. Importer le certificat CA du miroir dans le truststore Java (keytool)
# 3. Pré-télécharger toutes les dépendances Maven (go-offline) → couche cachée
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

# Copier les sources après le go-offline pour que cette couche soit invalidée
# uniquement lors d'un changement de code source (pas de dépendance)
COPY src ./src

# Compiler et packager le JAR (tests ignorés — ils sont exécutés en CI séparément)
RUN ./mvnw package -DskipTests -B -s .mvn/settings.xml

# ─────────────────────────────────────────────────────────────────────────────
# Étape 2 — Runtime : image finale allégée avec JRE uniquement (pas de JDK)
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre-alpine AS runtime

WORKDIR /app

# Copier uniquement le JAR produit par l'étape build (multi-stage → image minimale)
COPY --from=build /app/target/*.jar app.jar

# Port exposé par Spring Boot (configurable via SERVER_PORT)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
