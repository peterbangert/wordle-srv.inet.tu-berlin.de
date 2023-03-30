# wordle-srv.inet.tu-berlin.de



### Quickstart

On the host machine run:

    make deploy

### Description

The INET Wordle Game is deployed on 

    tst1.inet.tu-berlin.de

Within the virtual machine 

    wordle-srv.inet.tu-berlin.de

The game is hosted within the User `wordle`'s home directory `/home/wordle/wordle-srv.inet.tu-berlin.de`. The deployment process is to simply pull the latest changes on the master branch within this directory and run `make deploy` to update any new changes.

The Results for the experiments are located within the `backend/results` directory.

```
├── log
│   └── wordle_backend.log
├── results
│   └── 30032023
│       └── <user>_<id>.csv
├── words
│   ├── words_de.json
│   └── words_en.json
├── backend.sock
├── wordle_backend.py
└── wsgi.py
```

Observing the project structure above for the backend service, the `wordle_backend.py` contains the application code for the Flask backend service, and the `wsgi.py` is a web server gateway interface for communicating with nginx through the `backend.sock` unix socket. 

More importantly, the application logs are located in `log/wordle_backend.log` and the words, which can be changed within this directory location, are located in `words/words_{en,de}.json`



### How to Setup

On the host machine install:

1. [nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)


2. Clone repository into home directory

3. Install requirements.txt

    `pip install -r backend/requirements.txt`

4. Run `make setup`

### How to Deploy

Run `make deploy`