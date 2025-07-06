curl -v -X PUT http://localhost:4321/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY2ZjJjYTY0YmY5MGU0MDMxNTJlMjUiLCJpYXQiOjE3NTE1NzcyOTAsImV4cCI6MTc1MjE4MjA5MH0.CE7pHiQhjL81MHoDk3fSyHKpzbyIyFZFqq7lq_HhOgg" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "NewTest123!"
  }'