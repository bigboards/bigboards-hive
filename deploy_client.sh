#!/usr/bin/env bash

STAGE=$1

if [ "prod" = "$STAGE" ]; then
    BUCKET="hive.bigboards.io"

    # and upload it to AWS
    export AWS_DEFAULT_PROFILE="bigboards"
else
    BUCKET="hive.test.bigboards.io"

    # and upload it to AWS
    export AWS_DEFAULT_PROFILE="personal"
fi

pushd client
bower install
popd

aws s3 sync ./client s3://${BUCKET}/
