#!/usr/bin/env bash

pushd client
bower install
popd

# and upload it to AWS
export AWS_DEFAULT_PROFILE="bigboards"

aws s3 sync ./client s3://hive.test.bigboards.io/
