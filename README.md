# Smart Light Hello

**Demo Server** : [https://akjohn.dev/lightbulb](https://akjohn.dev/lightbulb)

# Description

This is a simple NodeJS project which allows you to let the Internet control a smart light bulb in your room. You can find more details about the implementation [here](https://blog.akjohn.dev/novelty-projects/smart-light-hello/).

# Prerequisites

The project depends on a few other open-source projects.

- [Home Assistant](https://www.home-assistant.io/)
- [InfluxDB2](https://docs.influxdata.com/influxdb/v2/)

# Setup

One way to run the server is using `systemd`, if your OS has it. Here is a sample service file:

```
[Unit]
Description=Smart Light Hello Service
After=network.target

[Service]
Type=simple
ExecStart=/home/john/.nvm/versions/node/v20.12.0/bin/node server.js
WorkingDirectory=/home/john/smart-light-hello/
User=john
Restart=always

[Install]
WantedBy=multi-user.target
```
