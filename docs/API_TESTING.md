# API Testing Documentation

## Overview
This document describes the testing strategy for the `/api/companies/join` endpoint and how to run the tests.

## Running Tests

### Run all tests
\`\`\`bash
npm test
\`\`\`

### Run tests in watch mode
\`\`\`bash
npm run test:watch
\`\`\`

### Run tests with coverage
\`\`\`bash
npm run test:coverage
\`\`\`

## Test Cases

### ✅ Validation Tests

1. **Missing enrollmentCode** - Returns 400 with `MISSING_FIELDS` code
2. **Missing providerId** - Returns 400 with `MISSING_FIELDS` code
3. **Invalid enrollmentCode format** - Returns 400 with `INVALID_FORMAT` code (must be 8 characters)

### ✅ Business Logic Tests

4. **Company not found** - Returns 404 with `NOT_FOUND` code
5. **Duplicate pending link** - Returns 400 with `DUPLICATE_LINK` code
6. **Duplicate approved link** - Returns 400 with `DUPLICATE_LINK` code
7. **Successful join request** - Returns 201 with new link data

### ✅ Error Handling Tests

8. **Database errors** - Returns 500 with `DATABASE_ERROR` code

## Error Response Structure

All API errors follow this structure:

\`\`\`typescript
{
  error: {
    message: string,
    code: string
  }
}
\`\`\`

### Error Codes

- `MISSING_FIELDS` - Required fields are missing
- `INVALID_FORMAT` - Input format is invalid
- `NOT_FOUND` - Resource not found (company with enrollment code)
- `DUPLICATE_LINK` - Link already exists
- `DATABASE_ERROR` - Database operation failed
- `CREATE_FAILED` - Failed to create resource
- `INTERNAL_ERROR` - Unexpected server error

## Frontend Integration

The frontend `JoinCompany` component handles these errors with toast notifications:

### Success
\`\`\`typescript
toast.success("Join request sent successfully! Waiting for admin approval.")
\`\`\`

### Errors
\`\`\`typescript
toast.error(error.message) // Shows the error message from API
\`\`\`

## Debugging

The API includes console.log statements with the `[v0]` prefix for debugging:

\`\`\`typescript
console.log("[v0] Looking up company with code:", enrollmentCode)
console.log("[v0] Company lookup result:", { company, companyError })
console.log("[v0] Checking for existing link")
console.log("[v0] Link creation result:", { link, linkError })
\`\`\`

These can be viewed in the server logs during development.

## Key Fixes Implemented

1. **Used `.maybeSingle()` instead of `.single()`** - Prevents errors when no company is found
2. **Added structured error responses** - Consistent error format with codes
3. **Improved validation** - Check enrollment code length before DB query
4. **Better error messages** - Clear, user-friendly error messages
5. **Proper HTTP status codes** - 400 for client errors, 404 for not found, 500 for server errors
6. **Frontend error handling** - Properly extracts error messages from structured responses
7. **Toast notifications** - Success and error toasts for user feedback
