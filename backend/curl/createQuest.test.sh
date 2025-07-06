curl -v -X POST http://localhost:4321/api/quests/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY2ZjRjZDBkYTgzOTUxMjU4MjQ1YmQiLCJpYXQiOjE3NTE1Nzc4MDUsImV4cCI6MTc1MjE4MjYwNX0.nkpC34M1vjtgKFvKDp-_IGxE1tgmW-IjvtG3VIZT5PY" \
  -d '{
    "title": "Test quest for cURL",
    "useAI": false,
    "difficulty": "STANDARD"
  }'