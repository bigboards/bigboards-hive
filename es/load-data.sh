#!/bin/sh
HOST=$1
ENVIRONMENT=$2
SEQ=$3

IDX="http://$HOST:9200/bigboards-hive-$ENVIRONMENT-$SEQ"

curl -XPOST ${IDX}/_bulk --data-binary @library.json; echo
#curl -XPOST ${IDX}/_bulk --data-binary @library-stacks.json; echo
