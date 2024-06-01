import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CuurWebCdkStack } from '../lib/cuur-web-cdk-stack';

const app = new cdk.App();
new CuurWebCdkStack(app, 'CuurWebCdkStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
});
