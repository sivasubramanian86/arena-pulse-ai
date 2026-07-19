#!/bin/sh
# Remove any Co-authored-by lines referencing Copilot from commit messages
perl -0777 -pe 's/^\s*Co-authored-by:.*Copilot.*\r?\n//gmi'