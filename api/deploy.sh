tsc
ssh root@staczero.com "mkdir -p /root/tourjs-api"
scp -r dist/* root@staczero.com:/root/tourjs-api
scp pm2.json root@staczero.com:/root/tourjs-api/pm2.json
scp package.json root@staczero.com:/root/tourjs-api/package.json
ssh root@staczero.com "cd /root/tourjs-api && npm install && pm2 restart pm2.json"
echo "Should be deployed!"