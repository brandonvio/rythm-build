import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cb from 'aws-cdk-lib/aws-codebuild'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export class RythmBuildStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

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
            source: cb.Source.gitHub({
                owner: 'brandonvio',
                repo: 'rythm-build',
                branchOrRef: 'main',
                webhook: true,
            }),
            buildSpec: cb.BuildSpec.fromSourceFilename('buildspec.yml'),
            environment: {
                buildImage: cb.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
        })

        new s3.Bucket(this, 'RythmBuildBucket', {
            bucketName: 'build.cdk.rythm.cc',
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            publicReadAccess: false,
        })
    }
}
