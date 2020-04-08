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

                stage('Build') {
                    sh """
                        pwd
                        docker stop migration_container || true && docker rm migration_container || true
                        docker run --name migration_container -v /var/lib/jenkins/workspace/Build/Core/QUML_Migration:/var/migration_task node npm install /var/migration_task && npm run migration /var/migration_task
                        id=\$(docker ps -aqf "name=migration_container")
                        docker rm \${id}
                    """
                }
                // stage('ArchiveArtifacts') {
                //     sh """
                //         mkdir reports-artifacts
                //         cp migration_task/reports/*.csv  reports-artifacts
                //         zip -j  reports-artifacts.zip:${artifact_version}  reports-artifacts/*
                //     """
                //     archiveArtifacts "reports-artifacts.zip:${artifact_version}"
                //     currentBuild.description = "${branch_name}_${commit_hash}"
                // }
            }
        }
    }
    catch (err) {
        currentBuild.result = "FAILURE"
        throw err
    }

}
