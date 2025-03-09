# Threat Model

## Description

The application is a simple web-based user management system designed to allow users to view their profiles after logging in. It consists of a web interface (UI), a server that processes requests, and a database that stores user data.

## Flow
```mermaid
sequenceDiagram
    participant User
    participant Server
    participant Database
    
    Note over User,Server: All communications are over HTTP, not HTTPS
    
    User->>Server: Request to view profile
    Note right of Server: No authentication check
    Server->>Database: SELECT * FROM users WHERE user_id = '123'
    Database-->>Server: User's profile data
    Server-->>User: User's profile data
    
    User->>Server: Request with username='admin' OR '1'='1'
    Note right of Server: Parameter directly used in SQL query
    Server->>Database: SELECT * FROM users WHERE username='admin' OR '1'='1'
    Database-->>Server: All users' data
    Server-->>User: All users' data
    
    User->>Server: Request with invalid user_id
    Note right of Server: Parameter directly used in SQL query
    Server->>Database: SELECT * FROM users WHERE user_id = 'invalid'
    Database-->>Server: SQL error: Invalid user_id
    Server-->>User: Error: SQL error: Invalid user_id
```

