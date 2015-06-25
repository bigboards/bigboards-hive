#!/bin/sh
HOST=$1
ENVIRONMENT=$2
SEQ=$3

curl -XDELETE http://$HOST:9200/bigboards-hive-$ENVIRONMENT-$SEQ -H "Content-Type: application/json"
