aws ecr get-login-password --region us-west-2 --profile rythm-build | docker login --username AWS --password-stdin 919217319840.dkr.ecr.us-west-2.amazonaws.com
docker pull python:3.8-slim-buster
docker tag python:3.8-slim-buster 919217319840.dkr.ecr.us-west-2.amazonaws.com/python-38-slim-buster:latest
docker push 919217319840.dkr.ecr.us-west-2.amazonaws.com/python-38-slim-buster:latest