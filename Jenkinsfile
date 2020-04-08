node() {
    try {
        String ANSI_GREEN = "\u001B[32m"
        String ANSI_NORMAL = "\u001B[0m"
        String ANSI_BOLD = "\u001B[1m"
        String ANSI_RED = "\u001B[31m"
        String ANSI_YELLOW = "\u001B[33m"

        ansiColor('xterm') {
           
                stage('Checkout') {
                    cleanWs()
                    if (params.github_release_tag == "") {
                        checkout scm
                        commit_hash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        branch_name = sh(script: 'git name-rev --name-only HEAD | rev | cut -d "/" -f1| rev', returnStdout: true).trim()
                        artifact_version = branch_name + "_" + commit_hash
                        println(ANSI_BOLD + ANSI_YELLOW + "github_release_tag not specified, using the latest commit hash: " + commit_hash + ANSI_NORMAL)
                        sh "git clone https://github.com/rahulshukla/migration_task migration_task"
                        sh "cd migration_task && git checkout origin/${branch_name} -b ${branch_name}"
                    } else {
                        def scmVars = checkout scm
                        checkout scm: [$class: 'GitSCM', branches: [[name: "refs/tags/${params.github_release_tag}"]], userRemoteConfigs: [[url: scmVars.GIT_URL]]]
                        artifact_version = params.github_release_tag
                        commit_hash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        branch_name = params.github_release_tag.split('_')[0]
                        println(ANSI_BOLD + ANSI_YELLOW + "github_release_tag specified, building from github_release_tag: " + params.github_release_tag + ANSI_NORMAL)
                        sh "git clone git clone https://github.com/rahulshukla/migration_task migration_task"
                        sh """
                            cd migration_task
                            checkout_tag=\$(git ls-remote --tags origin $branch_name* | grep -o "$branch_name.*" | sort -V | tail -n1)
                            git checkout tags/\${checkout_tag} -b \${checkout_tag}
                        """
                    }
                    echo "artifact_version: " + artifact_version

                }

                stage('Build') {
                    sh """
                        docker stop --force migration_container || true && docker rm --force migration_container || true
                        docker run --name migration_container -d -w /migration_task node sleep infinity
                        id=\$(docker ps -aqf "name=migration_container")
                        docker cp migration_task/  \${id}:.
                        docker exec \${id} npm install /migration_task
                        docker exec \${id} npm run migration /migration_task
                        mkdir /var/lib/jenkins/workspace/Build/Core/migration_QUML_task_CF/migration_task/generatedReports
                        docker cp \${id}:/migration_task/reports/  migration_task/generatedReports/
                        docker rm --force \${id}
                    """
                }
                stage('ArchiveArtifacts') {
                    sh """
                        mkdir reports-artifacts
                        cp /var/lib/jenkins/workspace/Build/Core/migration_QUML_task_CF/migration_task/generatedReports  reports-artifacts
                        cd /var/lib/jenkins/workspace/Build/Core/migration_QUML_task_CF/migration_task/
                        zip -j  reports-artifacts.zip:${artifact_version}  reports-artifacts/*
                    """
                    archiveArtifacts "reports-artifacts_${artifact_version}.zip"
                    currentBuild.description = "${branch_name}_${commit_hash}"
                }
            
        }
    }
    catch (err) {
        currentBuild.result = "FAILURE"
        throw err
    }

}
