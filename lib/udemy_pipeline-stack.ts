import * as cdk from '@aws-cdk/core';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { SecretValue } from '@aws-cdk/core';
import {CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction} from '@aws-cdk/aws-codepipeline-actions'
import { BuildSpec, LinuxBuildImage, PipelineProject } from '@aws-cdk/aws-codebuild';
// import * as sqs from '@aws-cdk/aws-sqs';

export class UdemyPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: 'UdemyPipeline',
      crossAccountKeys: false,
    });

    const pipeline_sourceOutput = new Artifact('CDKSourceOutput');
    const ServiceSourceOutput = new Artifact('ServiceSourceOutput')

    pipeline.addStage({
      stageName: 'Source',
      actions:[
        new GitHubSourceAction({
          owner: 'deandivin',
          repo:'UdemyExample',
          branch: 'main',
          actionName: 'PipelineSource',
          oauthToken: SecretValue.secretsManager('udemy-pipeline-token'),
          output: pipeline_sourceOutput
        }),

        new GitHubSourceAction({
          owner:'deandivin',
          repo: 'Udemy-express-lambda',
          branch: 'main',
          actionName: 'Service_Source',
          oauthToken: SecretValue.secretsManager('udemy-pipeline-token'),
          output: ServiceSourceOutput
        })

      ]
    });

    const cdkBuildOutput = new Artifact('CdkBuildOutput');

    pipeline.addStage({
      stageName: 'Codebuild',
      actions: [new CodeBuildAction({
          actionName: 'CDK_Build',
          input :pipeline_sourceOutput,
          outputs :[cdkBuildOutput],
          project: new PipelineProject(this, `CDKBuildProject`, {
            environment:{
              buildImage: LinuxBuildImage.STANDARD_5_0
            },
            buildSpec: BuildSpec.fromSourceFilename(
              "build-specs/cdk-build-spec.yml"
            ),
        }),
      }),
      ],
    });
//
    pipeline.addStage({
      stageName: "Pipeline_Update",
      actions:[
        new CloudFormationCreateUpdateStackAction( {
          actionName: "Pipeline_Update",
          stackName: "UdemyPipelineStack",
          templatePath: cdkBuildOutput.atPath("UdemyPipelineStack.template.json"),
          adminPermissions: true,
        }),
      ],
    });
  }
}
