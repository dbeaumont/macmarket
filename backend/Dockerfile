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

# 1. Installer openssl + ca-certificates (nécessaire pour extraire et enregistrer le CA du miroir Maven)
# 2. Importer le certificat CA du miroir dans le truststore Java (keytool) ET le store système Alpine (wget is used by mvnw to download the wrapper JAR)
# 3. Rediriger wrapperUrl/distributionUrl vers le miroir interne (repo1.maven.org inaccessible en entreprise)
# 4. Pré-télécharger toutes les dépendances Maven (go-offline) → couche cachée
RUN --mount=type=secret,id=artifactory_token  \
    apk add --no-cache openssl ca-certificates \
    && MIRROR_HOST=$(echo "${MAVEN_MIRROR_URL}" | sed 's|^https://||' | cut -d'/' -f1) \
    && openssl s_client -connect "${MIRROR_HOST}" -showcerts </dev/null 2>/dev/null \
       | awk '/-----BEGIN CERTIFICATE-----/{n++; f="/tmp/ca-"n".crt"} f{print > f} /-----END CERTIFICATE-----/{f=""}' \
    && for cert in /tmp/ca-*.crt; do \
         [ -f "${cert}" ] || break; \
         keytool -import -noprompt \
           -alias "jfrog-$(basename ${cert} .crt)" \
           -file "${cert}" \
           -keystore "${JAVA_HOME}/lib/security/cacerts" \
           -storepass changeit 2>/dev/null || true; \
         cp "${cert}" /usr/local/share/ca-certificates/; \
       done \
    && update-ca-certificates \
    && chmod +x mvnw \
    && sed -i "s|https://repo1.maven.org/maven2|${MAVEN_MIRROR_URL}|g" .mvn/wrapper/maven-wrapper.properties \
    && sed -i "s|\${env.MAVEN_MIRROR_URL}|${MAVEN_MIRROR_URL}|" .mvn/settings.xml \
    && export ARTIFACTORY_TOKEN=$(cat /run/secrets/artifactory_token) \
    && ./mvnw dependency:go-offline -B -s .mvn/settings.xml

# Copier les sources après le go-offline pour que cette couche soit invalidée
# uniquement lors d'un changement de code source (pas de dépendance)
COPY src ./src

# Compiler et packager le JAR (tests ignorés — ils sont exécutés en CI séparément)
RUN ./mvnw package -DskipTests -Pprod -B -s .mvn/settings.xml

# ─────────────────────────────────────────────────────────────────────────────
# Étape 2 — Runtime : image finale allégée avec JRE uniquement (pas de JDK)
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre-alpine AS runtime

# Créer un utilisateur non-root dédié — le processus Java ne doit pas tourner en root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copier uniquement le JAR produit par l'étape build (multi-stage → image minimale)
COPY --from=build /app/target/*.jar app.jar

# Basculer vers l'utilisateur non-root avant de lancer le processus
USER appuser

# Port exposé par Spring Boot (configurable via SERVER_PORT)
EXPOSE 8080

# Vérification de santé : interroge l'endpoint Actuator toutes les 30s
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
