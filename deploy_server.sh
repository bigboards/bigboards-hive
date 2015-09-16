#!/usr/bin/env bash

ENVIRONMENT="hive-api-test-env"
VERSIONSLUG=$(date +%Y%m%d-%H%M)
ZIPNAME=${VERSIONSLUG}-server.zip

# let's zip the code
pushd server
npm install
zip -FSr ../target/$ZIPNAME .
popd

# and upload it to AWS
export AWS_DEFAULT_PROFILE="bigboards"

aws s3 cp ./target/$ZIPNAME s3://hive-code/
aws elasticbeanstalk create-application-version --application-name hive-api --version-label $VERSIONSLUG --source-bundle S3Bucket=hive-code,S3Key=$ZIPNAME
aws elasticbeanstalk update-environment --environment-name $ENVIRONMENT --version-label $VERSIONSLUG