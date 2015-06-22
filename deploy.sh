#!/bin/bash
deb-s3 upload -p -b apt.bigboards.io --arch all -c $1 --access-key-id=$2 --secret-access-key=$3 target/*.deb