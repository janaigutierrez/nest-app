curl -v -X PUT http://localhost:4321/api/users/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY2ZWQ4OTY0YmY5MGU0MDMxNTJlMTMiLCJpYXQiOjE3NTE1NzU5NDUsImV4cCI6MTc1MjE4MDc0NX0.TFkNIcqLABXi8jdmoJNy-uNGgGV-sdvlSXGmQpnXyQI" \
  -d '{
    "email": "newemail2025@example.com",
    "password": "Test123!"
  }'