#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RythmBuildStack } from '../lib/rythm-build-stack';

const app = new cdk.App();
new RythmBuildStack(app, 'RythmBuildStack');
