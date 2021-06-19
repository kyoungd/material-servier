# ---------- DOCKER COMMANDS

sudo docker run --name db -e POSTGRES_PASSWORD=Service$11 -p 5432:5432 postgres

docker image ls
docker container ls

## list all container

docker ps -a

## remove all containers

docker system prune

# ---------- POSTGRESQL DATABASE SERVER

sudo docker run -p 5432:5432 db

## connect to local postgres

psql -p 5432 -d "postgres"

## postgres service:

systemctl stop postgresql
systemctl start postgresql
systemctl status postgresql

sudo service postgresql start
sudo service postgresql stop
sudo service postgresql restart

## run bash command in docker

docker exec -it <container-id> bash

## connect to docker postgres

psql -U postgres
\du

## create admin user

CREATE ROLE admin LOGIN SUPERUSER PASSWORD 'Service$11';
CREATE DATABASE webscrapper OWNER admin;

## restore database in docker postgres

cat backup.sql | docker exec -i [POSTGRESQL_CONTAINER] /usr/bin/psql -h [POSTGRESQL_HOST] -U [POSTGRESQL_USER] [POSTGRESQL_DATABASE]

cat webscrapper-db.sql | sudo docker exec -i ab75a508f3e4 /usr/bin/psql -h localhost -U admin webscrapper

# ---------- MATERIAL-SERVER

docker build -t material-server .
docker run -it -p 1337:1337 material-server

# ---------- MATERIAL-SERVER + POSTGRES

sudo docker-compose up

# ---------- MATERIAL-API IMAGE

sudo docker build -t material-api .
docker tun -it -p 5000:5000 material-api

### -------------SCRIPT TO RESET DATABASE TWEET/NEWS

DELETE FROM public.tweets;
delete from public.tweet_summaries;
delete from public.site_yahoos;
delete from public.news_summaries;
update public.symbos set
last_searched_on = null,
tweet_searched_on = null,
tweet_tweeted_on = null,
tweet_summary_on = null
