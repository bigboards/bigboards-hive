#!/bin/sh
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
IDX="http://$HOST:9200/bigboards-hive-test/library-item/$1"

curl -uadmin:1nktv1sjeS -XDELETE "${IDX}"; echo
#curl -XPOST ${IDX}/_bulk --data-binary @library-stacks.json; echo
