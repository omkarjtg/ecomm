#!/bin/sh

set -e

host="$MYSQL_HOST"
port="$MYSQL_PORT"

until nc -z -v -w30 "$host" "$port"; do
  echo "MySQL is unavailable - sleeping"
  sleep 2
done

echo "MySQL is up - executing command"
exec "$@"
