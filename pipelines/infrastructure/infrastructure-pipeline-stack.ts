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

        const codestartConnectionArn = cdk.Fn.importValue(
            'output-brandonvio-github-connection'
        )

        const sourceOutput = new codepipeline.Artifact()
        const sourceAction = new actions.CodeStarConnectionsSourceAction({
            actionName: 'GithubSourceAction',
            connectionArn: codestartConnectionArn,
            owner: 'brandonvio',
            repo: 'rythm-infrastructure',
            output: sourceOutput,
            branch: 'main', // default: 'master'
        })
        pipeline.addStage({
            stageName: 'SourceStage',
            actions: [sourceAction],
        })

        const project = new codebuild.PipelineProject(this, 'Project', {
            projectName: 'rythm-infrastructure-project',
            buildSpec: cb.BuildSpec.fromSourceFilename('buildspec.yml'),
            environment: {
                computeType: codebuild.ComputeType.SMALL,
                buildImage: cb.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
        })
        const buildAction = new actions.CodeBuildAction({
            actionName: 'BuildAction',
            project,
            input: sourceOutput,
            outputs: [new codepipeline.Artifact()], // optional
        })
        pipeline.addStage({
            stageName: 'BuildStage',
            actions: [buildAction],
        })

        // pipeline.addStage({
        //     stageName: 'deploy',
        //     actions: [],
        // })
    }
}
