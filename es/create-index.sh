#!/bin/sh
HOST=$1
ENVIRONMENT=$2
SEQ=$3

IDX="http://$HOST:9200/bigboards-hive-$ENVIRONMENT-$SEQ"

curl -uadmin:1nktv1sjeS -XPUT ${IDX} -H "Content-Type: application/json" -d @library-index.json
