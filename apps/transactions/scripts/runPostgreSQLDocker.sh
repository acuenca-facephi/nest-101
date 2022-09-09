#!/bin/bash
docker stop nest-transactions-postgres
docker rm nest-transactions-postgres

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
INIT_DB_SCRIPT_PATH=$SCRIPT_DIR/initdb.sql

docker run \
    --name nest-transactions-postgres \
    -p 5764:5432 \
    -e "POSTGRES_PASSWORD=admin1234" \
    -v $HOME/Documents/docker-volumes/nest-transactions-postgres_data:/var/lib/postgresql/data \
    -v $INIT_DB_SCRIPT_PATH:/docker-entrypoint-initdb.d/init.sql \
    -d postgres
