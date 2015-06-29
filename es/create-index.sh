#!/bin/sh
HOST=$1
ENVIRONMENT=$2
SEQ=$3

IDX="http://$HOST:9200/bigboards-hive-$ENVIRONMENT-$SEQ"

curl -XPUT ${IDX} -H "Content-Type: application/json" -d @library-index.json
