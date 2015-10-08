#!/usr/bin/env bash

ENVIRONMENT="hive-api-legacy-env"
VERSIONSLUG=$(date +%Y%m%d-%H%M)
ZIPNAME=${VERSIONSLUG}-${ENVIRONMENT}.zip

# let's npm the server
pushd ./src/main/
npm install
popd

# let's bower the client
pushd ./src/main/client/
bower install
popd

# let's zip the code
pushd ./src/main/
zip -FSr ../../target/$ZIPNAME .
popd

# and upload it to AWS
aws s3 cp ./target/$ZIPNAME s3://hive-code/  --profile bigboards
aws elasticbeanstalk create-application-version --application-name hive-api --version-label $VERSIONSLUG --source-bundle S3Bucket=hive-code,S3Key=$ZIPNAME --profile bigboards
aws elasticbeanstalk update-environment --environment-name $ENVIRONMENT --version-label $VERSIONSLUG --profile bigboards