#!/usr/bin/env sh

while true
do
   bun dephy-indexer "$@"

   # show result
   exitcode=$?
   echo "exit code of command is $exitcode"

   sleep 10
done
