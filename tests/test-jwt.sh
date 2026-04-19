#!/bin/bash

BASE_URL="https://localhost:8443"

echo "1. Register"
curl -k -s $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234","userName":"testuser"}' | jq .

echo "2. Login (get token)"
TOKEN=$(curl -k -s $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}' | jq -r '.token')
echo "Token: $TOKEN"

echo "3. Test without token (expect 401)"
curl -k -s -i $BASE_URL/api/users/me | head -1

echo "4. Test with token (expect 200)"
curl -k -s -i $BASE_URL/api/users/me \
  -H "Authorization: Bearer $TOKEN" | head -1

echo "5. User data:"
curl -k -s $BASE_URL/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq .