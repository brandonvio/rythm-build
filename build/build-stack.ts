import * as cdk from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as cb from 'aws-cdk-lib/aws-codebuild'
import * as codestarconnections from 'aws-cdk-lib/aws-codestarconnections'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export class RythmBuildStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const source = cb.Source.gitHub({
            owner: 'brandonvio',
            repo: 'rythm-build',
            branchOrRef: 'main',
            webhook: true,
        })

        const buildRole = new iam.Role(this, 'BuildRole', {
            roleName: 'rythm-build-role',
            assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
        })

        buildRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: ['*'],
                actions: ['*'],
            })
        )

        new cb.Project(this, 'RythmBuildProject', {
            role: buildRole,
            projectName: 'rythm-build-project',
            source: source,
            buildSpec: cb.BuildSpec.fromSourceFilename('buildspec.yml'),
            environment: {
                buildImage: cb.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
        })

        const githubConnection = new codestarconnections.CfnConnection(
            this,
            'RythmCodestarConnection',
            {
                connectionName: 'brandovio-github',
                providerType: 'GitHub',
            }
        )

        new cdk.CfnOutput(this, 'GithubConnectionOutput', {
            value: githubConnection.attrConnectionArn,
            exportName: 'output-brandonvio-github-connection',
        })
    }
}
