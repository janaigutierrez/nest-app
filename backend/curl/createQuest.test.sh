curl -v -X POST http://localhost:4321/api/quests/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODU0N2VlNzc1OTRkM2MzNDc1ZjA3MzAiLCJpYXQiOjE3NTA2OTMwNDMsImV4cCI6MTc1MTI5Nzg0M30.D9DUWyiVRZ4qMlEJTqnlI92vaqhelQjGM0PA2xxaw5g" \
  -d '{
    "title": "Go to the gym",
    "useAI": true,
    "difficulty": "STANDARD"
  }'