#!/bin/bash
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
HOST_2="bd98887cfe3cd9594b742d1e91be5149.us-east-1.aws.found.io"
ID=$1
FROM_ENV=$2
TO_ENV=$3

USER="hive"
PASSWD="1nktv1sjeS"

TS=$(date +"%T")
TMP_FILE=/tmp/$(uuid)

CURL="curl -u${USER}:${PASSWD}"

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    JQ_BIN="./jq-linux64"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    JQ_BIN="./jq-osx-amd64"
else
    echo "Running on something different then OSX or Linux is not supported. Exiting."
    exit 1
fi

GET_URL="http://$HOST:9200/bigboards-hive-$FROM_ENV/library-item/$ID"
$CURL -XGET "$GET_URL" | ${JQ_BIN} "._source" > $TMP_FILE
$CURL -XPOST "http://$HOST_2:9200/bigboards-hive-$TO_ENV/library-item/$ID" -d @${TMP_FILE}