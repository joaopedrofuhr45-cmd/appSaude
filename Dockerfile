FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /workspace
COPY appSaude/pom.xml ./pom.xml
COPY appSaude/src ./src
RUN mvn -B package \
    && cp target/*.jar /workspace/app.jar

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
RUN addgroup -S app && adduser -S -u 10001 -G app app
COPY --from=build --chown=app:app /workspace/app.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 10000
USER app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
