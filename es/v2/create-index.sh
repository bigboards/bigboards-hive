#!/bin/bash
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
ENVIRONMENT=$1
DATA_ENV=$2

USER="hive"
PASSWD="1nktv1sjeS"

TS=$(date +"%T")

CURL="curl --silent -u${USER}:${PASSWD}"

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    JQ_BIN="./jq-linux64"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    JQ_BIN="./jq-osx-amd64"
else
    echo "Running on something different then OSX or Linux is not supported. Exiting."
    exit 1
fi

CURR_IDX="bigboards-hive-${DATA_ENV}"
NEXT_IDX="bigboards-hive-${ENVIRONMENT}-0"

echo "Creating the new index ${NEXT_IDX}"
$CURL -XPUT "http://$HOST:9200/${NEXT_IDX}" -d @library-index.json

echo  "Copying the data from index (${CURR_IDX}) to the newly created (${NEXT_IDX})"
elasticdump --input="http://${USER}:${PASSWD}@${HOST}:9200/${CURR_IDX}" --output="http://${USER}:${PASSWD}@${HOST}:9200/${NEXT_IDX}"

echo "Setting the alias"
$CURL -XPOST "http://$HOST:9200/_aliases" -d "
{
    \"actions\": [
        { \"add\": {
            \"alias\": \"bigboards-hive-${ENVIRONMENT}\",
            \"index\": \"${NEXT_IDX}\"
        }}
    ]
}
"