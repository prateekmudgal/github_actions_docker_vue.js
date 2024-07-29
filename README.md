---

# Single-Page Application in Vue.js Deploy using Github Actions.

Some applications require rich interactivity, deep session depth, and non-trivial stateful logic on the frontend. The best way to build such applications is to use an architecture where Vue not only controls the entire page but also handles data updates and navigation without having to reload the page. This type of application is typically referred to as a Single-Page Application (SPA).

In short, a single-page application is an app that doesn't need to reload the page during its use and works within a browser.

 
I have a sample Single-Page Application built with Vue.js and Deploy with Github Actions.

Our goal here is to Dockerize this application and deploy it using GitHub Actions. We will automate the process of building the Docker image and running the container, ensuring a smooth deployment workflow.

## Prerequisites

Before proceeding with the deployment, ensure you have the following prerequisites set up:

- **GitHub Account and Repository**: You'll need a GitHub account and a repository to store your Vue.js application code.
- **Nginx Webserver**: Install and configure Nginx as your web server.
- **GitHub Actions Runner**: Configure a GitHub Actions runner and connect it with your server.
- **EC2 Instance (Ubuntu)**: Set up an Ubuntu EC2 instance on AWS to host your application.
- **Docker Installed**: Ensure Docker is installed on your server. You can install Docker by following these [instructions](https://docs.docker.com/engine/install/ubuntu/).

### Post-Installation Steps

After installing Docker, add your user to the Docker group to execute Docker commands without `sudo`:

```bash
sudo usermod -aG docker $USER
```

Log out and back in or restart your terminal session. Verify your user is added to the Docker group with:

```bash
cat /etc/group | grep docker
```

### Configuring GitHub Actions Runner

After configuring the GitHub Actions runner on your server, run the following commands to install and start the runner service:

```bash
./svc.sh install
./svc.sh start
```

> **Note:** To restart the runner in the background, ensure it's set up as a service. This prevents your server from being occupied by the runner process.

## Dockerizing the Vue.js Application

Initially, I attempted to use a single-stage Dockerfile but encountered a 404 error when launching a new container because the application wasn't running in the container. This issue led me to employ a multi-stage Dockerfile, which worked perfectly. Here is the Dockerfile:

```Dockerfile
# Build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY . .
RUN npm cache clean --force
RUN npm install --legacy-peer-deps
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

This approach also reduces the size of the image significantly.

### Building and Running the Docker Image Locally

To verify if it's working or not, execute the following commands:

```bash
docker build -t vueimagejs .
```

Now, to run a container:

```bash
docker container run -d -p 8081:80 vueimagejs
```

Verify by running:

```bash
curl localhost:8081
```

Or simply open `localhost:8081` in your browser.

## Deploying with GitHub Actions

We will use GitHub Actions to automate the deployment of our Vue.js application. The GitHub Actions workflow will handle building the Docker image and deploying it to a server.

### Setting Up GitHub Actions

1. **Create a `.github/workflows` directory** in your project's root if it doesn't already exist.
2. **Create a YAML file** inside this directory, e.g., `docker-image.yml`, with the following configuration:

```yaml
name: Deploy Vue.js Application

on:
  push:
    branches:
      - main  # Triggers the action on push to the main branch

jobs:
  build:
    runs-on: self-hosted   # Use the self-hosted runner configured with your server

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t vueimagejs .

      - name: Stop and Remove Existing Docker Container
        run: |
          if [ $(docker ps -aq -f name=vue_app) ]; then
              docker stop vue_app
              docker rm vue_app
          fi

      - name: Run Docker container
        run: docker container run -d --name vue_app -p 8081:80 vueimagejs
```

### Workflow Explanation

- **Checkout Code**: This step checks out your repository's code to the GitHub Actions runner.
- **Build Docker Image**: This command builds the Docker image with the specified tag `vueimagejs`.
- **Stop & Remove Existing Container**: This step checks if a container with the same name exists, stops, and removes it if it does, then launches a new one.
- **Run Docker Container**: This command runs the Docker container on port 8081, making your application accessible at `localhost:8081`.
  
![Screenshot (235)](https://github.com/user-attachments/assets/a8a4ce12-285c-443f-89f0-beaf6bed0d8d)

## Handling 404 Errors in SPA

In a Single-Page Application, you might encounter a `404 error` when you hit a URL directly or refresh the page. This happens because SPAs do not have server-side rendering. To resolve this, you can use a location block in the NGINX configuration file. Here's the configuration:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`try_files` tests for the existence of the file in the local file system and may rewrite the URL. If it does exist, it only remembers it and continues processing the rest of the location block. This configuration ensures that routes are handled by Vue.js and prevents 404 errors.

All of these details are already included in the Dockerfile. The Dockerfile first builds your Vue.js application and copies the `dist` folder to another NGINX image. It also copies the NGINX conf file to the `/etc/nginx/conf.d/` folder.

With these steps, you can achieve your goal. Feel free to adapt this documentation to your specific requirements and Flask application configuration.
![Screenshot (234)](https://github.com/user-attachments/assets/e28f35fd-a9c7-4421-b717-373203a2a5af)



# Thank You

I hope you find it useful. If you have any doubt in any of the step then feel free to contact me. If you find any issue in it then let me know.

<table>
  <tr>
    <th><a href="https://www.linkedin.com/in/prateek-mudgal-devops" target="_blank"><img src="https://img.icons8.com/color/452/linkedin.png" alt="linkedin" width="30"/></a></th>
    <th><a href="mailto:mudgalprateek00@gmail.com" target="_blank"><img src="https://img.icons8.com/color/344/gmail-new.png" alt="Mail" width="30"/></a></th>
  </tr>
</table>

---
