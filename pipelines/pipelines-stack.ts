import * as cdk from 'aws-cdk-lib'
import * as codestarconnections from 'aws-cdk-lib/aws-codestarconnections'
import { Construct } from 'constructs'
import { RythmStandardPipeline } from './lib/standard-pipeline'

export class RythmPipelinesStack extends cdk.Stack {
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

        const pipeline = new RythmStandardPipeline(
            this,
            'InfrastructurePipeline',
            {
                pipelineName: 'rythm-infrastructure',
                repoName: 'rythm-infrastructure',
                codestartConnectionArn: githubConnection.attrConnectionArn,
            }
        )
    }
}
