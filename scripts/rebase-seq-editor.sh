#!/bin/sh
# Replace 'pick' with 'reword' for the target commit during interactive rebase
sed -i 's/pick 095e4cd/reword 095e4cd/' "$1"