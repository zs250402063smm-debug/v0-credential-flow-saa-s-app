# Multi-Tenant System Guide

## Overview

CredentialFlow implements a comprehensive multi-tenant system where admins manage companies and providers can request access to multiple companies independently.

## Architecture

### Database Schema

#### Companies Table
- `id`: Unique company identifier
- `name`: Company name
- `enrollment_code`: 8-character unique code for provider enrollment
- `admin_id`: Reference to the admin who owns this company
- `created_at`, `updated_at`: Timestamps

#### Provider Company Links Table
- `id`: Unique link identifier
- `provider_id`: Reference to provider's profile
- `company_id`: Reference to company
- `status`: `pending`, `approved`, or `rejected`
- `request_note`: Optional note from provider (visible to admin)
- `requested_at`: When the request was made
- `approved_at`, `approved_by`: Approval details
- `rejected_at`, `rejected_by`: Rejection details

#### Admin Action Logs Table
- `id`: Unique log identifier
- `admin_id`: Who performed the action
- `action_type`: Type of action (`approve_request`, `reject_request`, `remove_provider`, etc.)
- `target_id`: ID of the target (provider, document, etc.)
- `company_id`: Which company this action relates to
- `notes`: Additional details
- `created_at`: Timestamp

### Data Isolation

All data is properly isolated by `company_id`:
- **Providers**: Linked to companies through `provider_company_links`
- **Documents**: Include `company_id` to ensure admins only see documents from their providers
- **Licenses**: Include `company_id` for proper data segregation

### Row Level Security (RLS)

RLS policies ensure:
- Admins can only view/modify data for their company
- Providers can only view/modify their own data
- Documents and licenses are isolated per company

## Admin Workflows

### 1. Creating a Company
1. Admin signs up with role `admin`
2. Navigates to `/admin/company`
3. Creates company (gets unique enrollment code)
4. Shares enrollment code with providers

### 2. Managing Provider Requests
1. View pending requests at `/admin/company`
2. Review provider details and optional request notes
3. Approve or reject requests
4. Approved providers appear in the admin dashboard

### 3. Removing Providers
1. View approved providers at `/admin/company`
2. Click "Remove" button for any provider
3. Provider is removed from company (must request access again)

### 4. Viewing Provider Data
1. Dashboard shows only approved providers for the admin's company
2. Documents and licenses are filtered by `company_id`
3. All actions are logged in `admin_action_logs`

## Provider Workflows

### 1. Requesting Company Access
1. Provider signs up with role `provider`
2. Navigates to `/provider/join-company`
3. Enters company enrollment code
4. Optionally adds request note (e.g., credentials, experience)
5. Submits request

### 2. Multi-Company Support
- Providers can request access to multiple companies
- Each request is independent
- Status tracked per company:
  - **Pending**: Awaiting admin approval
  - **Approved**: Can upload documents/licenses for that company
  - **Rejected**: Admin declined request

### 3. Uploading Documents/Licenses
- Must be approved for at least one company
- Documents/licenses are linked to specific company
- Only visible to that company's admin

## API Endpoints

### POST `/api/companies/create`
Create a new company.
\`\`\`json
{
  "name": "Company Name",
  "adminId": "admin-uuid"
}
\`\`\`

### POST `/api/companies/join`
Provider requests to join a company.
\`\`\`json
{
  "enrollmentCode": "ABC12345",
  "providerId": "provider-uuid",
  "requestNote": "Optional note to admin"
}
\`\`\`

### POST `/api/companies/approve-request`
Admin approves a provider request.
\`\`\`json
{
  "requestId": "link-uuid",
  "providerId": "provider-uuid",
  "companyId": "company-uuid"
}
\`\`\`

### POST `/api/companies/reject-request`
Admin rejects a provider request.
\`\`\`json
{
  "requestId": "link-uuid"
}
\`\`\`

### POST `/api/companies/remove-provider`
Admin removes a provider from company.
\`\`\`json
{
  "linkId": "link-uuid"
}
\`\`\`

## Security Features

1. **RLS Policies**: Enforce data isolation at database level
2. **Authentication Checks**: All API routes verify user identity
3. **Authorization**: Admins can only modify their company's data
4. **Audit Logging**: All admin actions are logged with timestamps
5. **Service Role Bypass**: Company lookup uses admin client to bypass RLS (safe for enrollment codes)

## Best Practices

1. **Admin**: Regularly review pending requests and action logs
2. **Provider**: Add meaningful request notes to help admins make decisions
3. **Both**: Keep enrollment codes secure (they grant request ability)
4. **Development**: Always test with multiple companies to ensure proper isolation
