#!/bin/sh
curl -XPOST http://$1:9200/_bulk --data-binary @library.json; echo
#curl -XPOST http://$1:9200/_bulk --data-binary @library-stacks.json; echo
