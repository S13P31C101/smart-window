pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Spring JAR') {
            steps {
                dir('backend') {
                    sh 'cp /application-oauth.yml ./src/main/resources/application-oauth.yml'

                    sh 'chmod +x ./gradlew' 
                    sh './gradlew build -x test'
                }
            }
        }
        
        stage('Build Spring Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t spring-reborn:latest .'
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                dir('infra') {
                    sh 'docker compose down'

                    sh 'cp /.env .env'
                    sh 'sudo rm -rf ./certs'
                    sh 'mkdir -p ./certs'
                    sh 'cp -rLT /ssl-certs ./certs'
                    
                    sh 'docker compose up -d --build'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}