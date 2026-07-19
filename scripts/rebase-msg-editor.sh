#!/bin/sh
# Edit the commit message file to remove Copilot co-author lines
perl -0777 -pe 's/^Co-authored-by:.*Copilot.*\n//gmi' "$1" > "$1".tmp && mv "$1".tmp "$1"