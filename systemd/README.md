# Wordle Systemd Service

> auth-github: peterbangert

### Description 

With the file `wordle_backend.service` the system service manager can now be used to start/stop/restart the Flask backend for our service. This is advantageous because it is easier to monitor and manage, ensures theres only one running instance, as well cleanly defines the process environment (python env) and logging location. 

When the file is placed in the directory `/etc/systemd/system` the systemd service manager will recognize it once systemd has been reloaded with `sudo systemctl daemon-reload`. Finally the Flask backend service can be started with `sudo systemctl start wordle_backend`.

In the `wordle_backend.service` file, the start command is set as:

```
    gunicorn --bind unix:backend.sock -m 007 wsgi:app
```

What this does is use the Gunicorn uWSGI to create a socket file called `backend.sock` inside of the working directory which is set as `/home/wordle/wordle-srv.inet.tu-berlin.de/backend/`. This uWSGI will then forward all incoming requests to the Flask app which is also being started as a sub-process of the running Gunicorn process. 
