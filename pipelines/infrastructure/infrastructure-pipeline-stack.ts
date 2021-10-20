import * as cdk from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as cb from 'aws-cdk-lib/aws-codebuild'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions'
import { Construct } from 'constructs'

export class RythmInfrastructurePipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
            pipelineName: 'rythm-infrastructure-pipeline',
        })

        const sourceOutput = new codepipeline.Artifact()
        const sourceAction = new actions.CodeStarConnectionsSourceAction({
            actionName: 'github-source-action',
            connectionArn:
                'arn:aws:codestar-connections:us-east-1:919217319840:connection/46b0165f-fb81-43ea-97dd-8e303e3a9221',
            owner: 'brandonvio',
            repo: 'rythm-infrastructure',
            output: sourceOutput,
            branch: 'master', // default: 'master'
        })
        pipeline.addStage({
            stageName: 'source-stage',
            actions: [sourceAction],
        })

        const project = new codebuild.PipelineProject(this, 'Project', {
            projectName: 'rythm-build-project',
            buildSpec: cb.BuildSpec.fromSourceFilename('buildspec.yml'),
            environment: {
                computeType: codebuild.ComputeType.SMALL,
                buildImage: cb.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
        })
        const buildAction = new actions.CodeBuildAction({
            actionName: 'rythm-codebuild-action',
            project,
            input: sourceOutput,
            outputs: [new codepipeline.Artifact()], // optional
        })
        pipeline.addStage({
            stageName: 'build-stage',
            actions: [buildAction],
        })

        // pipeline.addStage({
        //     stageName: 'deploy',
        //     actions: [],
        // })
    }
}
