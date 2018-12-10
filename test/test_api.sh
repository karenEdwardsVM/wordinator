#!/usr/bin/env bash

curl -s 'localhost:8000/wordinator/api/add_list?list_name=Jimmy&content=apple,pomme|dog,chien|pear,poire'

curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0'
exit
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0' | jq '.[0].word'
