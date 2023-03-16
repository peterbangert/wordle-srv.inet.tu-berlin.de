# wordle-srv.inet.tu-berlin.de



### Quickstart

On the host machine run:

    `make deploy`

### Description




### How to Setup

On the host machine install:

1. [nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)

2. Flask and Gunicorn

  `python3 -m pip install Flask gunicorn`

3. Install this repository in your home directory. 
  - the current configurations are designed to work with username student-super

4. Run `make setup`

### How to Deploy

Run `make deploy`