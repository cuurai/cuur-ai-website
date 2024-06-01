import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CuurWebCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference existing S3 bucket
    const siteBucket = s3.Bucket.fromBucketName(this, 'ExistingSiteBucket', 'cuur.ai');

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    // Deploy static site to S3
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset('../out')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Lambda function for sending emails
    const sendEmailLambda = new lambda.Function(this, 'SendEmailFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        SES_EMAIL_SOURCE: 'your-verified-email@example.com', // Replace with your verified SES email address
      },
    });

    // Add SES permissions to Lambda
    sendEmailLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // API Gateway for Lambda function
    const api = new apigateway.RestApi(this, 'SendEmailApi', {
      restApiName: 'Send Email Service',
      description: 'This service sends an email.',
    });

    const sendEmailIntegration = new apigateway.LambdaIntegration(sendEmailLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    api.root.addMethod('POST', sendEmailIntegration); // POST /send-email

    // Outputs
    new cdk.CfnOutput(this, 'BucketURL', { value: siteBucket.bucketWebsiteUrl });
    new cdk.CfnOutput(this, 'CloudFrontURL', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'ApiEndpoint', { value: api.url });
  }
}
