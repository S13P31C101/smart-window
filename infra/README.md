## Dev

```sh
../backend
gradlew build -x test
docker build -t spring-reborn:latest .
../infra
docker compose -f docker-compose.dev.yml up -d --build
```

## Prod

```sh
../backend
gradlew build -x test
docker build -t spring-reborn:latest .
../infra
docker compose up -d --build
```