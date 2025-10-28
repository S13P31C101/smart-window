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
                    sh 'docker-compose down'
                    
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finished.'
            // 불필요한 Docker 이미지 정리 등
            // sh 'docker image prune -f'
        }
    }
}