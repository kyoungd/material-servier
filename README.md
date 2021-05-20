# ---------- DOCKER COMMANDS

sudo docker run --name postgres -e POSTGRES_PASSWORD=Service$11 -p:5432:5432 postgres

docker image ls
docker container ls

## list all container

docker ps -a

## remove all containers

docker system prune

# ---------- POSTGRESQL DATABASE SERVER

## connect to local postgres

psql -p5432 -d "postgres"

## postgres service:

systemctl stop postgresql
systemctl start postgresql
systemctl status postgresql

## run bash command in docker

docker exec -it <container-id> bash

## connect to docker postgres

psql -U postgres

## create admin user

CREATE ROLE admin LOGIN SUPERUSER PASSWORD 'Service$11';
CREATE DATABASE webscrapper OWNER admin;

## restore database in docker postgres

cat backup.sql | docker exec -i [POSTGRESQL_CONTAINER] /usr/bin/psql -h [POSTGRESQL_HOST] -U [POSTGRESQL_USER] [POSTGRESQL_DATABASE]

cat webscrapper-db.sql | sudo docker exec -i ab75a508f3e4 /usr/bin/psql -h localhost -U admin webscrapper

# ---------- MATERIAL-SERVER

docker build -t material-server .
docker run -it -p 1337:1337 material-server
sudo

# ---------- MATERIAL-SERVER + POSTGRES

sudo docker-compose up
