import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as RythmBuild from '../lib/rythm-build-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new RythmBuild.RythmBuildStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
