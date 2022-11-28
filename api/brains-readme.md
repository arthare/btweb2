How to train the brains:
-Run `brains-grab.sh` - this will download all the training data from the server
-Go into `./brains`, and manually prune the brains that you don't care about:
-->players that don't play often
-->players that you've already got a kickass trained bot for
-Run `brains-train.sh` - this will try to train up some bots based on that training data, and put the outputted brains into `./braintrain`
-Once you've run `brains-train.sh` long enough, grab your highest-scoring brain folder for each player in `./braintrain`, and put them into `./deploy-brains`.  They will be deployed next time you update the server
-->Included with a deploy: ...maybe.  It runs a calibration simulation before deploying, and if the brain ends up blitzing the course at 80km/h, it will not be deployed.
-->"Long Enough": The PhilBoBot is the gold-standard for excellence in smartness, and it was only trained to 0.80.
-->Put the brains in `./deploy-brains` into git if you're really happy with them