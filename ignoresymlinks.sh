#!/usr/bin/env bash
for f in $(git status --porcelain | grep '^??' | sed 's/^?? //'); do
    test -L "$f" && echo $f >> .gitignore; # add symlinks
    # test -d "$f" && echo $f\* >> .gitignore; # add new directories as well
done