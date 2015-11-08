#!/bin/bash
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
ENVIRONMENT=dev

USER="admin"
PASSWD="1nktv1sjeS"

TS=$(date +"%T")

IDX="http://$HOST:9200/bigboards-hive-dev-$SEQ"
CURL="curl --silent -u${USER}:${PASSWD}"

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    JQ_BIN="./jq-linux64"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    JQ_BIN="./jq-osx-amd64"
else
    echo "Running on something different then OSX or Linux is not supported. Exiting."
    exit 1
fi

echo "Getting the current dev index version"
CURRENT_IDX=$($CURL -XGET "http://$HOST:9200/_alias/bigboards-hive-dev" | ${JQ_BIN} 'keys[0]' | sed -e 's/^"//'  -e 's/"$//')
CURRENT_SEQ=$(echo $CURRENT_IDX | cut -d '-' -f4)
NEXT_SEQ=$(expr $CURRENT_SEQ + 1)
NEXT_IDX="bigboards-hive-dev-${NEXT_SEQ}"
echo "Found the current index to be ${CURRENT_IDX} so the next index would be ${NEXT_IDX}"

echo "Creating the new dev index ${NEXT_IDX}"
$CURL -XPUT "http://$HOST:9200/${NEXT_IDX}" -d @library-index.json

echo  "Copying the data from test to the newly created dev index (${NEXT_IDX})"
elasticdump --input="http://${USER}:${PASSWD}@${HOST}:9200/bigboards-hive-test" --output="http://${USER}:${PASSWD}@${HOST}:9200/${NEXT_IDX}"

echo "Switch the alias"
$CURL -XPOST "http://$HOST:9200/_aliases" -d "
{
    \"actions\": [
        { \"remove\": {
            \"alias\": \"bigboards-hive-dev\",
            \"index\": \"${CURRENT_IDX}\"
        }},
        { \"add\": {
            \"alias\": \"bigboards-hive-dev\",
            \"index\": \"${NEXT_IDX}\"
        }}
    ]
}
"