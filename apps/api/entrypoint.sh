#!/bin/sh

# Start nginx daemon in the background
echo "Starting Nginx..."
nginx

# Start Spring Boot application in the foreground
echo "Starting Spring Boot Application..."
exec java -jar app.jar
