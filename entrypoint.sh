#!/bin/sh

# Run database migrations
flask db upgrade

# Run the application
exec "$@"