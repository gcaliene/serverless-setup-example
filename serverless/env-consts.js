const envs = Object.freeze({
  staging: 1,
  production: 2
});
const labels = Object.freeze({
  [envs.staging]: 'staging',
  [envs.production]: ''
});

const secretName = Object.freeze({
  [envs.staging]: 'company/staging/project/api',
  [envs.production]: 'company/prod/project/api'
});

const snsTopicArn = Object.freeze({
  [envs.staging]: 'arn:aws:sns:region:awsAcctNumber:Staging-Lambda-Alerts',
  [envs.production]: 'arn:aws:sns:region:awsAcctNumber:Production-Lambda-Alerts'
});

module.exports = {
  envs, labels, secretName, snsTopicArn
};
