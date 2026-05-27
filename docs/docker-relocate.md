# Relocate Docker data to your `goinfre` storage
In case memory space isn't enough to build the containers.

This document explains how to stop the rootless Docker daemon, clean up Docker data, move your Docker data directory to your local `goinfre` storage, and relink it so Docker uses that location. 

`/goinfre/goinfre/Perso/<username>/docker`
FYI: from notion page:
"The goinfre folder uses local storage. On the computer itself. When the computer has less than 20% storage space available it will delete the contents of the entire goinfre folder. This is checked every monday"




- Stop any `npm`, `docker` or other file operations before moving files.

Steps

1) Stop Docker and any running compose services

```bash
# stop compose-managed services for the current project
docker compose -f docker-compose.yml down

# stop rootless Docker daemon for your user
systemctl --user stop docker
sleep 2
```

2) (Optional) Prune unused docker objects to free space

```bash
# removes stopped containers, unused images, networks and volumes
docker system prune -a --volumes -f
```

3) Create the destination directory on your goinfre area

```bash
mkdir -p /goinfre/goinfre/Perso/<username>/docker
```

4) Move Docker data into the new location

Prefer `rsync` if available (safer for many files). Run one of these (not both):

```bash
# If rsync exists, run this (safe, resumable):
command -v rsync >/dev/null 2>&1 && rsync -a --remove-source-files ~/.local/share/docker/ /goinfre/goinfre/Perso/ilazar/docker/ && find ~/.local/share/docker -type d -empty -delete || echo "rsync not found"

# If rsync is not available, fallback to a plain move
mv ~/.local/share/docker/* /goinfre/goinfre/Perso/<username>/docker/ || true
```

5) Replace the old docker data directory with a symlink

```bash
# remove any leftover old docker dir (should be empty after rsync or mv)
rm -rf ~/.local/share/docker

# ensure parent exists and create symlink
mkdir -p ~/.local/share
ln -s /goinfre/goinfre/Perso/<username>/docker ~/.local/share/docker

# verify
ls -la ~/.local/share/docker
```

6) Start Docker and verify it's using the new root

```bash
systemctl --user start docker
sleep 3

# should print the new path: /goinfre/goinfre/Perso/<username>/docker
docker info --format '{{.DockerRootDir}}'

# quick free-space checks
df -h /home /goinfre /sgoinfre
```

7) Rebuild your project

```bash
# build and run (from your project root)
docker compose -f docker-compose.yml up -d --build
```

Troubleshooting notes
- If Docker fails to start with overlay/permission errors, check if the target is actually a local filesystem (not NFS):

```bash
# shows filesystem type (ext4 is good; nfs4 is not for overlay2)
df -T /goinfre/goinfre/Perso/<username>/docker
```

- If you see `failed to Lchown "/etc/shadow" for UID 0, GID ... (try increasing the number of subordinate IDs in /etc/subuid and /etc/subgid)`, this means rootless Docker needs more subordinate UID/GID ranges; contact admins.

- If builds fail with ENOSPC inside the container, ensure the host disk where DockerRootDir lives has enough free space (use `df -h`) and that `docker info` shows the correct root.

Reverting the change

If you need to put Docker back to your home, remove the symlink and move files back:

```bash
systemctl --user stop docker
rm ~/.local/share/docker
mv /goinfre/goinfre/Perso/<username>/docker ~/.local/share/docker
systemctl --user start docker
```

