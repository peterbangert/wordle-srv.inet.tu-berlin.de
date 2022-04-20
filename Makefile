deploy:
	${MAKE} deploy-nginx
	${MAKE} restart-backend
	sleep 5
	${MAKE} reset-signals

deploy-nginx:
	sudo cp nginx/wordle-srv.inet.tu-berlin.de /etc/nginx/sites-enabled/
	sudo systemctl reload nginx.service

restart-backend:
	sudo systemctl restart wordle_backend

setup:
	cp systemd/wordle_backend.service /etc/systemd/system
	sudo systemctl daemon-reload
	sudo systemctl start wordle_backend