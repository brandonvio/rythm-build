import * as cdk from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions'
import { Construct } from 'constructs'

interface RythmStandardPipelineProps {
    readonly pipelineName: string
    readonly repoName: string
    readonly codestartConnectionArn: string
    readonly pipelineRole: iam.IRole
    readonly buildRole: iam.IRole
}

export class RythmStandardPipeline extends Construct {
    constructor(
        scope: Construct,
        id: string,
        props: RythmStandardPipelineProps
    ) {
        super(scope, id)

        const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
            pipelineName: `${props.pipelineName}-pipeline`,
            role: props.pipelineRole,
        })

        const sourceOutput = new codepipeline.Artifact()
        const sourceAction = new actions.CodeStarConnectionsSourceAction({
            actionName: 'GithubSourceAction',
            connectionArn: props.codestartConnectionArn,
            owner: 'brandonvio',
            repo: props.repoName,
            output: sourceOutput,
            branch: 'main',
        })
        pipeline.addStage({
            stageName: 'SourceStage',
            actions: [sourceAction],
        })

        const project = new codebuild.PipelineProject(this, 'Project', {
            projectName: `${props.pipelineName}-project`,
            buildSpec: codebuild.BuildSpec.fromSourceFilename(
                'deployment/buildspec.yml'
            ),
            environment: {
                computeType: codebuild.ComputeType.SMALL,
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
            role: props.buildRole,
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
