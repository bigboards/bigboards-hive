#!/bin/bash
deb-s3 upload -p -b apt.bigboards.io --arch armv7l -c $1 --access-key-id=$2 --secret-access-key=$3 target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch i386 -c $1 --access-key-id=$2 --secret-access-key=$3 target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch amd64 -c $1 --access-key-id=$2 --secret-access-key=$3 target/*.deb