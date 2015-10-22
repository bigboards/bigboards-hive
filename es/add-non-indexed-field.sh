#!/bin/sh
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
ENVIRONMENT=$1
SEQ=$2
TYPE=$3
FIELD_NAME=$4
FIELD_TYPE=$5

IDX="http://$HOST:9200/bigboards-hive-$ENVIRONMENT-$SEQ/_mapping/$TYPE"

curl -uadmin:1nktv1sjeS -XPUT ${IDX} -d "
{
    \"${TYPE}\" : {
        \"properties\" : {
            \"${FIELD_NAME}\" : {\"type\" : \"${FIELD_TYPE}\", \"index\": \"not_analyzed\"}
        }
    }
}
"
