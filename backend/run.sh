#!/bin/bash

# Run potential migrations
flask db upgrade

# Start server
flask run
