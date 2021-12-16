#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { UdemyPipelineStack } from '../lib/udemy_pipeline-stack';
import { BillingStack } from "../lib/billing-stack";

const app = new cdk.App();
new UdemyPipelineStack(app, 'UdemyPipelineStack', {
});

new BillingStack(app, 'BillingStack', {
  budgetAmount:5,
  emailAddress:'deandivin@outlook.com',
});