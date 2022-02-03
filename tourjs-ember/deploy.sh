ember build --environment=production

SIGNIN=art@172.105.28.136
scp -r dist/* $SIGNIN:/var/www
