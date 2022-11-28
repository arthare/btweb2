tsc
pskill node
rm -rf braintrain
mkdir -p ./braintrain
nohup node dist/index.js neural > braintrain/results1.txt &
tail -f braintrain/results1.txt