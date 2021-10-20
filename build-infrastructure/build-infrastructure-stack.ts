import * as cdk from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as cb from 'aws-cdk-lib/aws-codebuild'
import * as codestarconnections from 'aws-cdk-lib/aws-codestarconnections'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export class RythmBuildInfratructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // create a KMS key.
        // create roles for codebuild and codepipeline.
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
