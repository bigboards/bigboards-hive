#!/bin/sh
curl -XDELETE http://$1:9200/bigboards-hive
curl -XPUT http://$1:9200/bigboards-hive -H "Content-Type: application/json" -d @library-index.json
