#!/bin/bash
set -e

rm -rf dist
tsc
node dist/api/index.js self-check

SIGNIN=art@tourjs.ca
APIHOSTDIR=/home/art/tourjs-api

ssh $SIGNIN "mkdir -p $APIHOSTDIR && mkdir -p $APIHOSTDIR/brains && rm -rf $APIHOSTDIR/deploy-brains && mkdir -p $APIHOSTDIR/deploy-brains"

scp -r ./deploy-brains/* $SIGNIN:$APIHOSTDIR/deploy-brains/
scp -r dist/* $SIGNIN:$APIHOSTDIR
scp pm2.json $SIGNIN:$APIHOSTDIR/pm2.json
scp ssl-config-prod.json $SIGNIN:$APIHOSTDIR/ssl-config.json
scp db-config.json $SIGNIN:$APIHOSTDIR/db-config.json
scp package.json $SIGNIN:$APIHOSTDIR/package.json
scp package-lock.json $SIGNIN:$APIHOSTDIR/package-lock.json
ssh $SIGNIN "cd $APIHOSTDIR && npm install"

echo "You'll have to manually go in to the server to pm2 restart for some reason - every attempt of mine fails to start it properly, but doing it manually does it.  Just go to $APIHOSTDIR and ./restart-on-server.sh"
echo "You'll have to manually go in to the server to pm2 restart for some reason - every attempt of mine fails to start it properly, but doing it manually does it.  Just go to $APIHOSTDIR and ./restart-on-server.sh"
echo "You'll have to manually go in to the server to pm2 restart for some reason - every attempt of mine fails to start it properly, but doing it manually does it.  Just go to $APIHOSTDIR and ./restart-on-server.sh"
echo "You'll have to manually go in to the server to pm2 restart for some reason - every attempt of mine fails to start it properly, but doing it manually does it.  Just go to $APIHOSTDIR and ./restart-on-server.sh"
echo "You'll have to manually go in to the server to pm2 restart for some reason - every attempt of mine fails to start it properly, but doing it manually does it.  Just go to $APIHOSTDIR and ./restart-on-server.sh"
read -p "Press enter to continue"