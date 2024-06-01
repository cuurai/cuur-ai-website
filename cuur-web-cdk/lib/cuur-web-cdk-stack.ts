import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as path from 'path';

export class CuurWebCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use existing S3 bucket for static site hosting
    const siteBucket = s3.Bucket.fromBucketName(this, 'SiteBucket', 'cuur.ai');

    // Use existing CloudFront distribution
    const distribution = cloudfront.Distribution.fromDistributionAttributes(this, 'SiteDistribution', {
      distributionId: 'E3NG0ICI7CEQUN', 
      domainName: 'd3fa5ekggobzys.cloudfront.net', 
    });

    // Deploy static site to S3 and invalidate CloudFront cache
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../out')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'], // Ensure CloudFront invalidation is triggered
    });

    // Lambda function to handle email sending
    const sendEmailLambda = new lambda.Function(this, 'SendEmailFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        SES_EMAIL: 'info@cuur.ai', // Replace with your verified SES email address
      },
    });

    // Add SES permissions to Lambda
    sendEmailLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'SendEmailApi', {
      restApiName: 'Send Email Service',
      description: 'This service sends an email.',
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.IAM,
      },
    });

    const sendEmailIntegration = new apigateway.LambdaIntegration(sendEmailLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    api.root.addResource('send-email').addMethod('POST', sendEmailIntegration);

    // Add IAM permissions for the Lambda function to invoke the API Gateway endpoint
    sendEmailLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['execute-api:Invoke'],
      resources: [
        `arn:aws:execute-api:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:${api.restApiId}/*/*/*`
      ],
    }));
  }
}
