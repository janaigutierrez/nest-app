curl -v -X PUT http://localhost:3000/api/quests/YOUR_QUEST_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Updated Morning Workout",
    "scheduledTime": "14:30",
    "scheduledDate": "2025-08-22",
    "duration": 90,
    "difficulty": "EPIC"
  }'