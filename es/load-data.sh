#!/bin/sh
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
IDX="http://$HOST:9200/bigboards-hive-$1/library-item/$2"

curl -uadmin:1nktv1sjeS -XPOST "${IDX}" --data-binary @${3}; echo
#curl -XPOST ${IDX}/_bulk --data-binary @library-stacks.json; echo
