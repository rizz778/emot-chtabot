#!/bin/bash

# Install libGL.so.1 for OpenCV (fixes your error)
apt-get update && apt-get install -y libgl1

# Start Gunicorn server
gunicorn --bind 0.0.0.0:8080 wsgi:application

