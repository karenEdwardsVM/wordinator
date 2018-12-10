#!/usr/bin/env bash

result=$(curl -s 'localhost:8000/wordinator/api/add_list?list_name=French_Vocab&content=apple,pomme|dog,chien|pear,poire')
echo "$result"
list_id=$(echo "$result" | jq '.list_id' | cut -d '"' -f 2)
echo "Created list_id $list_id"

ncreated=$(
  curl -s 'localhost:8000/wordinator/api/add_list?list_name=French_Vocab&content=apple,pomme|dog,chien|pear,poire|||||' |\
    jq '.inserted' | cut -d '"' -f 2
)
echo "Creating list with 3 elements, has: $ncreated"

curl -s 'localhost:8000/wordinator/api/get_word?list_id=2'; echo ""
curl -s 'localhost:8000/wordinator/api/get_word?update_seen=1&list_id=2'; echo ""

curl -s 'localhost:8000/wordinator/api/get_words?count=3&list_id=2'; echo ""

#curl -s 'localhost:8000/wordinator/api/get_user_lists?email=awlkdnawd@gmail.com'; echo ""
