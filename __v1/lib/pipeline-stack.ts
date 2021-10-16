import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from "@aws-cdk/aws-iam";
import { Role } from "@aws-cdk/aws-iam";

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const buildRole = new iam.Role(this, "BuildRole", {
      roleName: "rythm-build-role",
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    buildRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["*"],
        effect: iam.Effect.ALLOW,
      })
    );

    const pipeline = new codepipeline.Pipeline(this, "RythmSvcPipeline", {
      pipelineName: "rythm-svc-pipeline",
    });

    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: "github-source",
      owner: "brandonvio",
      repo: "rythm-micro-serv",
      oauthToken: cdk.SecretValue.secretsManager("brandonvio-github-auth-token"),
      output: sourceOutput,
      branch: "main", // default: 'master'
    });

    pipeline.addStage({
      stageName: "pull-source1",
      actions: [sourceAction],
    });

    const buildMicroServProject = new codebuild.PipelineProject(this, "BuildMicroServProject", {
      projectName: "rythm-price-micro-serv-proj",
      buildSpec: codebuild.BuildSpec.fromSourceFilename("build.yaml"),
      role: buildRole,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
        privileged: true,
      },
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "build-rythm-micro-serv-project",
      input: sourceOutput,
      project: buildMicroServProject,
    });

    pipeline.addStage({
      stageName: "build-stage",
      actions: [buildAction],
    });
  }
}
