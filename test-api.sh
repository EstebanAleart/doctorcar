#!/bin/bash

# Test script para validar que POST /api/appointments está guardando correctamente

echo "🧪 Testing Appointments API Flow..."
echo "===================================="
echo ""

# Test 1: GET /api/appointments (sin auth debería funcionar ahora)
echo "Test 1: GET /api/appointments (sin auth)"
curl -s -X GET http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  | head -c 200
echo ""
echo ""

# Test 2: POST /api/appointments sin auth (debería fallar con 401)
echo "Test 2: POST /api/appointments sin auth (should return 401)"
curl -s -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "test-claim",
    "scheduledDate": "2026-02-20",
    "scheduledTime": "10:00",
    "type": "inspection"
  }' | head -c 300
echo ""
echo ""

echo "✓ Basic endpoint tests complete"
echo ""
echo "📝 Next steps:"
echo "1. Login to the application (open http://localhost:3001)"
echo "2. Create or select a claim"
echo "3. Accept the claim with an appointment date"
echo "4. Check database: SELECT * FROM appointments WHERE claim_id = '...';"
echo ""
