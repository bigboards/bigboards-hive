#!/usr/bin/env bash

if git diff-index --quiet HEAD --; then
    echo "Workingcopy is clean"
else
    echo "Please commit your changes first!" && exit 1
fi

STAGE=$1
VERSIONSLUG=$(date +%Y%m%d-%H%M)

if [ "prod" = "$STAGE" ]; then
    BUCKET="hive.bigboards.io"

    # and upload it to AWS
    export AWS_DEFAULT_PROFILE="bigboards"
else
    BUCKET="hive.test.bigboards.io"

    # and upload it to AWS
    export AWS_DEFAULT_PROFILE="bigboards"
fi

pushd client
bower install
echo $VERSIONSLUG > client.version
popd

aws s3 sync ./client s3://${BUCKET}/

git tag -a "client-${STAGE}-${VERSIONSLUG}" -m "Deployment of client to ${STAGE}"
git push origin "client-${STAGE}-${VERSIONSLUG}"
