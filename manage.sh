#!/bin/bash
if [ "$1" == "start" ]; then
    docker-compose up --build -d
elif [ "$1" == "stop" ]; then
    docker-compose down
else
    echo "Invalid option. Use 'start' to start the application and 'stop' to stop it."
fi