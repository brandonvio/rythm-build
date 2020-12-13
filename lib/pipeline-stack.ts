import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from "@aws-cdk/aws-iam";
import * as events from "@aws-cdk/aws-events";

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const powerUserPolicy = iam.ManagedPolicy.fromManagedPolicyArn(
      this,
      "BuildPolicy",
      "arn:aws:iam::aws:policy/PowerUserAccess"
    );

    const buildRole = new iam.Role(this, "BuildRole", {
      roleName: "HiddenRoadPipelineRole",
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      managedPolicies: [powerUserPolicy],
    });

    const pipeline = new codepipeline.Pipeline(this, "HiddenRoadPipeline", {
      pipelineName: "hidden-road-pipeline",
      // role:
    });

    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "brandonvio",
      repo: "rythm-micro-serv",
      oauthToken: cdk.SecretValue.secretsManager("brandonvio-github-auth-token"),
      output: sourceOutput,
      branch: "main", // default: 'master'
    });

    pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    const buildMicroServProject = new codebuild.PipelineProject(this, "BuildMicroServProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("rythm-build.yaml"),
      role: buildRole,
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "build-rythm-micro-serv-project",
      input: sourceOutput,
      project: buildMicroServProject,
    });

    pipeline.addStage({
      stageName: "build-stage-01",
      actions: [buildAction],
    });
  }
}
