FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./index.html /usr/share/nginx/html

COPY /etc/letsencrypt/live/ai.my-lab.blog/fullchain.pem /etc/letsencrypt/live/ai.my-lab.blog/fullchain.pem
COPY /etc/letsencrypt/live/ai.my-lab.blog/privkey.pem /etc/letsencrypt/live/ai.my-lab.blog/privkey.pem