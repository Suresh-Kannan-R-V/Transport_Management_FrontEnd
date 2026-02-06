pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git url: ,
                    branch: 'master',
                    credentialsId: 'github-pat'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Server') {
            steps {
                sh 'sudo rm -rf /var/www/'
                sh 'sudo cp -r build/* /var/www/'
                sh 'sudo systemctl restart nginx'
            }
        }
    }

    post {
        success {
            echo 'Deployment Completed Successfully!'
        }
        failure {
            echo 'Deployment Failed!'
        }
    }
}
