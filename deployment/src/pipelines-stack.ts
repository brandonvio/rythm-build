import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as kms from 'aws-cdk-lib/aws-kms'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as codestarconnections from 'aws-cdk-lib/aws-codestarconnections'
import { Construct } from 'constructs'
import { RythmStandardPipeline } from './standard-pipeline'
import pipelinesConfig from './pipelines-config.json'

export class RythmPipelinesStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        new ecr.Repository(this, 'RythmPythomSlimBuster', {
            repositoryName: 'python-38-slim-buster',
        })

        const kmsKey = new kms.Key(this, 'RythmKmsKey', {
            description: 'Rythm CodePipeline KMS key.',
            alias: 'rythm-codepipeline-kms-key',
        })

        const codePipelineBucket = new s3.Bucket(
            this,
            'RythmCodePipelineBucket',
            {
                bucketName: 'codepipeline.rythm.cc',
                encryptionKey: kmsKey,
                encryption: s3.BucketEncryption.KMS,
                blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
                publicReadAccess: false,
            }
        )

        const leetBucket = new s3.Bucket(this, 'RythmLeetBucket', {
            bucketName: 'leet.brandonv.io',
            encryptionKey: kmsKey,
            encryption: s3.BucketEncryption.KMS,
            websiteIndexDocument: 'index.html',
            publicReadAccess: true,
        })

        // create roles for codebuild and codepipeline.
        const pipelineRole = new iam.Role(this, 'PipelineRole', {
            roleName: 'rythm-pipeline-role',
            assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
        })

        const buildRole = iam.Role.fromRoleArn(
            this,
            'BuildRole',
            'arn:aws:iam::919217319840:role/rythm-build-role'
        )

        pipelineRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: ['*'],
                actions: ['*'],
            })
        )

        const githubConnection = new codestarconnections.CfnConnection(
            this,
            'RythmCodestarConnection',
            {
                connectionName: 'brandovio-github',
                providerType: 'GitHub',
            }
        )

        for (const pipelineConfig of pipelinesConfig.standardPipelines) {
            const pipeline = new RythmStandardPipeline(
                this,
                pipelineConfig.name,
                {
                    pipelineName: pipelineConfig.pipelineName,
                    repoName: pipelineConfig.repoName,
                    codestartConnectionArn: githubConnection.attrConnectionArn,
                    pipelineRole,
                    buildRole,
                    kmsKey,
                    codePipelineBucket,
                }
            )
        }
    }
}
