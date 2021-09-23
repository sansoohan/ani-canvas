#!/bin/sh

lsof -ti tcp:9000 | xargs kill -9
lsof -ti tcp:9100 | xargs kill -9
lsof -ti tcp:9200 | xargs kill -9
lsof -ti tcp:9300 | xargs kill -9
lsof -ti tcp:9400 | xargs kill -9
lsof -ti tcp:9500 | xargs kill -9
lsof -ti tcp:9600 | xargs kill -9
lsof -ti tcp:9700 | xargs kill -9
lsof -ti tcp:9800 | xargs kill -9
lsof -ti tcp:9900 | xargs kill -9
