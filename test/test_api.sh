#!/usr/bin/env bash

#curl -s 'localhost:8000/wordinator/api/add_list?list_name=Jimmy&content=apple,pomme|dog,chien|pear,poire'
#echo ""

echo "\nGet word"
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0&list_id=4'

echo "\nGet word"
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=0&list_id=4'

echo "\nGet words:"
curl -s 'localhost:8000/wordinator/api/get_words?count=3&list_id=4'
