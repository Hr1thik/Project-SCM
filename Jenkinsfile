pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'hr1thik/online-exam-backend'
        DOCKER_CREDS = credentials('dockerhub-creds')
    }

    stages {
        stage('SAST (Semgrep)') {
            steps {
                echo 'Running Static Application Security Testing...'
                sh '''
                    mkdir -p reports
                    docker run --rm -v ${WORKSPACE}:/src semgrep/semgrep semgrep --config=p/owasp-top-ten --config=p/javascript --json -o /src/reports/sast_report.json /src || true
                '''
            }
        }

        stage('SCA (Trivy)') {
            steps {
                echo 'Scanning dependencies for CVEs...'
                sh '''
                    mkdir -p reports
                    docker run --rm -v ${WORKSPACE}:/src aquasec/trivy:latest fs --severity HIGH,CRITICAL -o /src/reports/trivy_report.txt /src || true
                '''
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                echo 'Building and publishing backend container...'
                sh """
                    echo "\$DOCKER_CREDS_PSW" | docker login -u "\$DOCKER_CREDS_USR" --password-stdin
                    docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ./backend
                    docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest
                    docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Update Manifest for ArgoCD') {
            steps {
                echo 'Updating deployment image tag for GitOps sync...'
                withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sh """
                        sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|g" k8s/deployment.yaml
                        git config user.email "jenkins@ci.local"
                        git config user.name "Jenkins CI"
                        git add k8s/deployment.yaml
                        git commit -m "chore(cd): update image tag to ${BUILD_NUMBER} [skip ci]" || true
                        git push https://${GH_TOKEN}@github.com/Hr1thik/Project-SCM.git HEAD:main
                    """
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/*', allowEmptyArchive: true
            sh 'docker logout || true'
            cleanWs()
        }
    }
}