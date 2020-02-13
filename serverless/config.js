const _ = require('lodash');
const AWS = require('aws-sdk');
const packageJson = require('../package.json');
const envConsts = require('./env-consts');

const client = new AWS.SecretsManager({
  region: 'us-east-1'
});
const SERVICE_NAME = 'this-is-your-service-name';

function getEnvLabel(envValue) {
  return envConsts.labels[envValue];
}

function getPostfixForEnv(envValue) {
  if (envConsts.envs.production === envValue) {
    return '';
  }
  return `-${getEnvLabel(envValue)}`;
}

function getDeploymentBucket(envValue) {
  const deploymentBucketBase = 'company-svc-deployment';

  if (envConsts.envs.production === envValue) {
    return deploymentBucketBase;
  }
  return `${deploymentBucketBase}-staging`;
}

function getDbSecretName(envValue) {
  return envConsts.secretName[envValue];
}

// Call the AWS API and return a Promise
function getAwsSecret(secretName) {
  return client.getSecretValue({
    SecretId: secretName
  }).promise();
}

function getSnsTopicArn(envValue) {
  return envConsts.snsTopicArn[envValue];
}

module.exports = async (serverless) => {
  const env = _.get(serverless, 'variables.options.stage');

  if (!env || !_.has(envConsts.envs, env)) {
    throw new Error(`${env} not a supported environment`);
  }

  const envValue = envConsts.envs[env];
  const envLabel = getEnvLabel(envValue);
  const envPostfix = getPostfixForEnv(envValue);
  const secretResponse = await getAwsSecret(getDbSecretName(envValue)).catch((err) => {
    throw err;
  });
  const dbSecret = JSON.parse(secretResponse.SecretString);


  return {
    env: envLabel,
    product: 'EHServices',
    application: SERVICE_NAME,
    version: packageJson.version,
    envPostfix,
    service: `${SERVICE_NAME}${envPostfix}`,
    snsTopicArn: getSnsTopicArn(envValue),
    deploymentBucket: getDeploymentBucket(envValue),
    dbSecret
  };
};
