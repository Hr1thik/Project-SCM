pipeline {
    agent any

    environment {
        DOCKER_USER  = 'hr1thik'
        IMAGE_NAME   = 'online-exam-backend'
        IMAGE_TAG    = "${BUILD_NUMBER}"
        DOCKER_CREDS = credentials('dockerhub-creds')
    }

    stages {
        stage('SAST (Semgrep)') {
            steps {
                echo 'Running Static Application Security Testing...'
                sh '''
                    mkdir -p reports
                    docker run --rm -v "${WORKSPACE}:/src" semgrep/semgrep semgrep \
                      --config=p/owasp-top-ten \
                      --config=p/javascript \
                      --json -o /src/reports/sast_report.json /src || true
                '''
            }
        }

        stage('SCA (Trivy)') {
            steps {
                echo 'Scanning dependencies for CVEs...'
                sh '''
                    mkdir -p reports
                    docker run --rm -v "${WORKSPACE}:/src" aquasec/trivy:latest fs \
                      --severity HIGH,CRITICAL \
                      -o /src/reports/trivy_report.txt /src || true
                '''
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                echo 'Building and publishing backend container...'
                sh '''
                    echo "$DOCKER_CREDS_PSW" | docker login -u "$DOCKER_CREDS_USR" --password-stdin
                    docker build -t ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} ./backend
                    docker tag ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_USER}/${IMAGE_NAME}:latest
                    docker push ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${DOCKER_USER}/${IMAGE_NAME}:latest
                '''
            }
        }

        stage('Update Manifest for ArgoCD') {
            steps {
                echo 'Updating deployment image tag for GitOps sync...'
                sh '''
                    sed -i "s|image: ${DOCKER_USER}/${IMAGE_NAME}:.*|image: ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}|g" k8s/deployment.yaml
                    git config --global user.email "jenkins@ci.local"
                    git config --global user.name "Jenkins CI"
                    git add k8s/deployment.yaml
                    git commit -m "chore(cd): update image tag to ${IMAGE_TAG} [skip ci]" || echo "No changes to commit"
                    git push origin main
                '''
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