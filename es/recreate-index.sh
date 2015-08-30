#!/bin/sh
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
ENVIRONMENT=dev
SEQ=$1

IDX="http://$HOST:9200/bigboards-hive-$ENVIRONMENT-$SEQ"

curl -uadmin:1nktv1sjeS -XDELETE ${IDX} -H "Content-Type: application/json"

curl -uadmin:1nktv1sjeS -XPUT ${IDX} -H "Content-Type: application/json" -d @library-index.json
curl -uadmin:1nktv1sjeS -XPOST ${IDX}/_bulk --data-binary @library.json; echo
