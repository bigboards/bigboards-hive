#!/bin/bash
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"

USER="hive"
PASSWD="1nktv1sjeS"

TS=$(date +"%T")

CURL="curl --silent -u${USER}:${PASSWD}"

echo "Creating the aut-hive index"
$CURL -XPUT "http://$HOST:9200/aut-hive" -d @library-index.json