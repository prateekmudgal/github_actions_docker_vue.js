FROM node:lts-alpine as build-stage
WORKDIR /app
COPY . .
RUN npm cache clean --force
RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
