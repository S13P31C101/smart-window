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
                    sh 'mkdir -p ./certs'
                    sh 'sudo cp -rLT /ssl-certs ./certs'
                    sh 'sudo find ./certs -type d -exec chmod 755 {} \\+'
                    sh 'sudo find ./certs -type f -exec chmod 644 {} \\+'
                    
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