curl -v -X POST http://localhost:3000/api/quests/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Morning Workout Session",
    "difficulty": "STANDARD",
    "useAI": false,
    "isScheduled": true,
    "scheduledDate": "2025-08-22",
    "scheduledTime": "09:00",
    "duration": 60
  }'