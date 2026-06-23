# 1 Make sure Docker is STOPPED
systemctl --user stop docker
sleep 2


# 2 Create Docker's daemon config pointing to goinfre:

mkdir -p ~/.config/docker
cat > ~/.config/docker/daemon.json << 'EOF'
{
  "data-root": "/goinfre/goinfre/Perso/jslusark/docker"
}
EOF

# 3 Verify the config:
cat ~/.config/docker/daemon.json

# 4 Start Docker:
systemctl --user start docker
sleep 3
docker info --format '{{.DockerRootDir}}'

# 5 Then run setup:
make setup

