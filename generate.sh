#!/bin/bash

GAMEEVENTSURL=https://raw.githubusercontent.com/Poggicek/cs2-docs/master/docs/dumped-data/game-events.mdx

if [ -f GEN_HASH ]; then
    . ./GEN_HASH
    if [ "$(curl ${GAMEEVENTSURL} -s | md5sum | cut -d ' ' -f 1)" = "${HASH}" ]; then
        echo "[Swiftly Generator - Game Events] The file is already updated."
        exit 0
    fi
fi

mkdir tmp
cd tmp

wget ${GAMEEVENTSURL}
sed -e '1,18d' -i game-events.mdx
cd ..

hash=$(curl ${GAMEEVENTSURL} -s | md5sum | cut -d ' ' -f 1)

rm -rf GEN_HASH

cat >> GEN_HASH <<EOF
#!/bin/bash
HASH=${hash}
EOF

node src/generator.js

rm -rf tmp