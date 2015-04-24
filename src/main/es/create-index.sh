#!/bin/sh
curl -XDELETE http://$1:9200/bigboards-library
curl -XPUT http://$1:9200/bigboards-library -H "Content-Type: application/json" -d @library-index.json
