#!/usr/bin/env bash

pushd client
bower install
popd

# and upload it to AWS
aws s3 sync ./client s3://hive.test.bigboards.io/
