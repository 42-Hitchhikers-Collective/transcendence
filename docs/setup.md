# Setup

# Repo Structure
.
├── apps
│   ├── api
│   │   ├── Dockerfile
│   │   └── src
│   └── web
│       ├── Dockerfile
│       └── src
├── docker-compose.yml
├── docs
│   └── setup.md
├── Makefile
├── nginx
│   ├── certs
│   └── nginx.conf
└── README.md

# Commands (from repo)
npm create vite@latest apps/web -- --template react-ts
<!--
Need to install the following packages:
create-vite@8.3.0
Ok to proceed? (y) y


> npx
> create-vite apps/web --template react-ts

│
◇  Target directory "apps/web" is not empty. Please choose how to proceed:
│  Ignore files and continue
│
◇  Use Vite 8 beta (Experimental)?:
│  No
│
◇  Install with npm and start now?
│  Yes
│
◇  Scaffolding project in /home/sevo/Desktop/transcendence/apps/web...
│
◇  Installing dependencies with npm...

added 175 packages, and audited 176 packages in 11s

45 packages are looking for funding
-->

npm i -g @nestjs/cli
nest new apps/api

<!--
Which package manager would you ❤️  to use? npm

-->