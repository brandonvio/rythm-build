# Rythm Build

This project is the "build" project for the rythm application. This project contains the pipeline definitions in CDK for the building and deploying of the rythm applications. Links to the rythm microservice projects, that are deployed by this pipeline, are below.

### [rythm-price-micro-serv](https://github.com/brandonvio/rythm-micro-serv)
The "rythm-price-micro-serv" is the Python application that consumes a HTTP pricing stream from the Oanda API and sends the received messages to a Kafka Topic hosted on the Confluent Cloud platform. The Python application is hosted in Docker and ran in ECS Fargate Task on AWS.

### [rythm-price-micro-serv-cdk](https://github.com/brandonvio/rythm-micro-serv)
The "rythm-price-micro-serv-cdk" project is the CDK application that provisions the infrastructure for the application.

![Architecture](https://github.com/brandonvio/rythm-build/blob/main/docs/images/build-arch.png?raw=true)
