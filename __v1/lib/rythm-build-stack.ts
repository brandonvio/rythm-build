import * as cdk from "@aws-cdk/core";
import { PipelineStack } from "./pipeline-stack";

export class RythmBuildStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new PipelineStack(this, "PipelineStack");
  }
}
