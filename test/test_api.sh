#!/usr/bin/env bash

curl -s 'localhost:8000/wordinator/api/add_list?list_name=French_Vocab&content=apple,pomme|dog,chien|pear,poire'
echo ""

curl -s 'localhost:8000/wordinator/api/get_word?list_id=4'; echo ""
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=1&list_id=4'; echo ""

curl -s 'localhost:8000/wordinator/api/get_words?count=3&list_id=4'; echo ""
