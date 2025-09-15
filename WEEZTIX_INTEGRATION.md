# Weeztix Badge Integration

## Overview
This integration automatically awards badges to users when they purchase tickets through Weeztix. The system uses webhooks to receive order notifications and assigns the configured badge to the user based on their email address.

## Features
- 🎫 Automatic badge assignment on ticket purchase
- 🔄 Webhook-based real-time updates
- 🛡️ Signature verification for security
- 📊 Order tracking in database
- 🧪 Test endpoint for development

## Setup Instructions

### 1. Database Migration
Run the database migration to create the required tables:
```bash
supabase db push
# or
supabase migration up
```

This creates the `weeztix_orders` table to track purchases and badge assignments.

### 2. Environment Configuration
Add the following environment variables to your `.env` file:

```env
# Weeztix API Configuration
WEEZTIX_API_KEY=your-weeztix-api-key
WEEZTIX_WEBHOOK_SECRET=your-webhook-secret
WEEZTIX_TICKET_BADGE_ID=badge-uuid-for-ticket-purchase
WEEZTIX_SHOP_GUID=your-shop-guid
```

### 3. Badge Creation
Create or verify the Workshop/Partner badge in Supabase:

```sql
-- Check if badge exists
SELECT * FROM public.badges WHERE id = '319b8937-cc53-4b1c-a2ef-b9f97aa81f51';

-- If not exists, create it:
INSERT INTO public.badges (id, name, description, slug, style)
VALUES (
  '319b8937-cc53-4b1c-a2ef-b9f97aa81f51', -- Workshop/Partner Badge ID
  'Workshop Partner',
  'Workshop-Teilnehmer über Weeztix',
  'workshop-partner',
  '{"variant": "special", "color": "#FF6B6B", "borderStyle": "solid"}'::jsonb
);
```

### 4. Webhook Registration
Register your webhook endpoint with Weeztix:

**Webhook URL**: `https://your-domain.com/api/weeztix/webhook`

Contact the Weeztix API team (apiteam@weeztix.com) to register your webhook endpoint for order events.

### 5. Testing the Integration

#### Using the Test Endpoint (Development Only)
```bash
# Get test endpoint information
curl http://localhost:5173/api/weeztix/test-webhook

# Send a test webhook
curl -X POST http://localhost:5173/api/weeztix/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstname": "Test",
    "lastname": "User",
    "status": "completed"
  }'
```

#### Manual Badge Assignment
You can manually assign a Weeztix badge using the service:

```typescript
import { assignWeeztixBadgeToUser } from '$lib/services/badge-service';
import { supabase } from '$lib/supabase';

// Assign badge to user
const success = await assignWeeztixBadgeToUser(
  supabase,
  userId,
  orderGuid // optional
);
```

## API Endpoints

### Webhook Handler
**POST** `/api/weeztix/webhook`

Receives order notifications from Weeztix and processes them:
- Verifies webhook signature
- Stores order information
- Matches user by email
- Assigns badge if user exists

### Test Webhook
**GET/POST** `/api/weeztix/test-webhook` (Development only)

Simulates Weeztix webhook calls for testing:
- GET: Shows endpoint information and example payload
- POST: Sends test webhook to the main handler

## Data Flow

### Automatic Badge Assignment (User bereits registriert)
1. **Order Completed**: User completes ticket purchase on Weeztix
2. **Webhook Sent**: Weeztix sends order data to webhook endpoint
3. **Signature Verification**: System verifies webhook authenticity
4. **User Matching**: System finds user by email address
5. **Order Storage**: Order details saved to `weeztix_orders` table
6. **Badge Assignment**: Badge automatically assigned to user
7. **Update Tracking**: Order marked with badge assignment status

### Claim System (User noch nicht registriert)
1. **Order Completed**: User completes ticket purchase on Weeztix
2. **Webhook Sent**: Weeztix sends order data to webhook endpoint
3. **No User Found**: System generates unique claim code
4. **Order Storage**: Order saved with claim code
5. **Email Notification**: Claim instructions sent to purchaser
6. **User Registration**: User registers on djworkshopgermany.de
7. **Auto-Claim**: System automatically claims orders with matching email
8. **Manual Claim**: User can also use claim code if different email

## Database Schema

### weeztix_orders Table
```sql
- id: UUID (Primary key)
- order_guid: Text (Unique Weeztix order ID)
- user_id: UUID (Reference to user)
- user_email: Text (Customer email)
- customer_firstname: Text
- customer_lastname: Text
- ticket_guid: Text
- reservation_guid: Text
- event_date_guid: Text
- product_guid: Text
- purchase_date: Timestamp
- webhook_data: JSONB (Raw webhook payload)
- badge_assigned: Boolean
- badge_assigned_at: Timestamp
- claim_code: Text (Unique code for manual claiming)
- claimed_at: Timestamp (When order was claimed)
- claim_email_sent: Boolean
- claim_email_sent_at: Timestamp
- created_at: Timestamp
- updated_at: Timestamp
```

## Security Considerations

1. **Webhook Signature**: Always verify webhook signatures in production
2. **Environment Variables**: Never commit API keys to version control
3. **Rate Limiting**: Consider implementing rate limiting on webhook endpoint
4. **Idempotency**: System prevents duplicate badge assignments
5. **User Matching**: Uses email address for user identification

## Monitoring

### Logs to Monitor
- Webhook receipt confirmations
- Badge assignment success/failure
- User matching results
- Signature verification failures

### Database Queries
```sql
-- Check recent orders
SELECT * FROM weeztix_orders
ORDER BY created_at DESC
LIMIT 10;

-- Check badge assignment status
SELECT
  wo.order_guid,
  wo.user_email,
  wo.badge_assigned,
  ub.assigned_at
FROM weeztix_orders wo
LEFT JOIN user_badges ub ON wo.user_id = ub.user_id
WHERE ub.badge_id = 'your-badge-id';

-- Find unassigned badges
SELECT * FROM weeztix_orders
WHERE user_id IS NOT NULL
AND badge_assigned = false;
```

## Troubleshooting

### Badge Not Assigned
1. Check if user exists with the email from order
2. Verify WEEZTIX_TICKET_BADGE_ID is configured
3. Check webhook logs for errors
4. Ensure badge exists in badges table

### Webhook Not Received
1. Verify webhook URL is registered with Weeztix
2. Check server logs for incoming requests
3. Test with the test endpoint
4. Verify firewall/security settings

### User Not Found
- Users must exist in the system before purchase
- Email addresses must match exactly (case-insensitive)
- Consider implementing a queue for retry logic

## Future Enhancements

- [ ] Email notification on badge assignment
- [ ] Retry mechanism for failed assignments
- [ ] Admin dashboard for order management
- [ ] Support for multiple badge types based on ticket type
- [ ] Bulk import of historical orders
- [ ] Queue system for processing webhooks