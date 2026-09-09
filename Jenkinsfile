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
                withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sh '''
                        # Update the image tag in deployment manifest
                        sed -i "s|image: hr1thik/online-exam-backend:.*|image: hr1thik/online-exam-backend:${BUILD_NUMBER}|g" k8s/deployment.yaml

                        # Configure Git author
                        git config user.email "jenkins@ci.local"
                        git config user.name "Jenkins CI"

                        # Commit the change
                        git add k8s/deployment.yaml
                        git commit -m "chore(cd): update image tag to ${BUILD_NUMBER} [skip ci]"

                        # Push current HEAD directly to remote main branch using authentication token
                        git push https://${GH_TOKEN}@github.com/Hr1thik/Project-SCM.git HEAD:main
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