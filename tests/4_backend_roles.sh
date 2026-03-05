#!/usr/bin/env bash
set -euo pipefail

TOKEN=$(curl -sk https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

curl -sk https://localhost/api/admin/users -H "Authorization: Bearer $TOKEN"