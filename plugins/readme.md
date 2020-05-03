How do I see this working?
-A user will fire up the "waterrower" plugin
-If the waterrower plugin doesn't see a local plugin server, it'll start one
-As data comes in from the rower, it'll POST that to the server

Then, the actual browser game:
-When they click "plugin" icon to set up device, it'll search for localhost:63939/device-list
-They'll be able to select from one of the devices that are sending data to the server
-I guess we can try for a websocket connection for speedy dissemination of wattage data

Why like this?
-Obviously we can't start a webserver that takes incoming data in the browser itself, so the plugin system needs to be a separate standalone process
-By separating the "plugin manager server" from the actual individual plugins, it will make things more flexible if I later have to write a C++ plugin
-Given the many hops that a piece of power data has to make, (measurement->computer->plugin host->browser->tourjs.ca), using a websocket for the browser<->plugin host communication seems necessary to minimize latency