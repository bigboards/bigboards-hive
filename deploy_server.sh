#!/usr/bin/env bash
STAGE=$1

if git diff-index --quiet HEAD --; then
    echo "Workingcopy is clean"
else
    echo "Please commit your changes first!" && exit 1
fi

if [ "prod" = "$STAGE" ]; then
    ENVIRONMENT="hive-api-prod"
    APP_NAME="hive-api"
    # and upload it to AWS
    export AWS_DEFAULT_PROFILE="bigboards"
    echo "Deploying to production"
else
    STAGE="test"
    ENVIRONMENT="hive-api-test-env"
    APP_NAME="hive-api"

    # and upload it to AWS
    export AWS_DEFAULT_PROFILE="bigboards"
    echo "Deploying to test"
fi

VERSIONSLUG=$(date +%Y%m%d-%H%M)
ZIPNAME=${VERSIONSLUG}-server.zip

# let's zip the code
pushd server
npm install
echo $VERSIONSLUG > server.version
mkdir -p ../target
zip -FSqr ../target/$ZIPNAME .
popd

echo "Using AWS profile '$AWS_DEFAULT_PROFILE'"

aws s3 cp ./target/$ZIPNAME s3://hive-code/
aws elasticbeanstalk create-application-version --application-name "${APP_NAME}" --version-label $VERSIONSLUG --source-bundle S3Bucket=hive-code,S3Key=$ZIPNAME
aws elasticbeanstalk update-environment --environment-name $ENVIRONMENT --version-label $VERSIONSLUG

git tag -a "server-${STAGE}-${VERSIONSLUG}" -m "Deployment of server to ${STAGE}"
git push origin "server-${STAGE}-${VERSIONSLUG}"