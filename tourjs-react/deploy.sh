npm run build

SIGNIN=art@tourjs.ca
scp -r build/* $SIGNIN:/var/www
