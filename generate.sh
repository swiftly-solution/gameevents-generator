#!/bin/bash

mkdir tmp
cd tmp

wget https://raw.githubusercontent.com/Poggicek/cs2-docs/master/docs/dumped-data/game-events.mdx
sed -e '1,18d' -i game-events.mdx
cd ..

node src/generator.js

rm -rf tmp