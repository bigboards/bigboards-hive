#!/bin/sh
HOST=$1
ENVIRONMENT=$2
SEQ=$3

curl -XPUT http://$HOST:9200/bigboards-hive-$ENVIRONMENT-$SEQ -H "Content-Type: application/json" -d @library-index.json
