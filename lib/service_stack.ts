import { Stack, StackProps } from "@aws-cdk/core";
import {Code, Function, Runtime} from "@aws-cdk/aws-lambda";
import { Construct } from "constructs";
import {HttpApi} from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';


export class ServiceStack extends Stack{
    public readonly serviceCode: Code
    constructor(scope: Construct, id: string, props?:StackProps){
        super(scope, id, props);
        
        this.serviceCode = Code.fromCfnParameters();

        const lambda = new Function(this, "Service lambda", {
            runtime: Runtime.NODEJS_14_X,
            handler: 'src/lambda.handler',
            code: this.serviceCode,
            functionName: "ServiceLambda"
        })

        new HttpApi(this, "ServiceApi", {
            defaultIntegration: new LambdaProxyIntegration({
                handler: lambda,
            }),
            apiName: "MyService",

        })
    }
}