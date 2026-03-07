# Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `invalid_request` | 400 | The request was unacceptable, often due to missing a required parameter. |
| `authentication_error` | 401 | No valid API key provided. |
| `insufficient_funds` | 402 | The wallet does not have enough balance for the transaction. |
| `not_found` | 404 | The requested resource doesn't exist. |
| `rate_limit_exceeded` | 429 | Too many requests hit the API too quickly. |
| `internal_server_error` | 500 | Something went wrong on WarmHeart's end. |
