# Placement Management System API Documentation

## Table of Contents

- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Students](#students)
- [Placement Cells](#placement-cells)
- [Recruiters](#recruiters)

## Base URL

```
/api/v1
```

## Authentication

### Register User

```
POST /auth/register
```

**Request Body**: Based on role type (discriminated union)

**Student Registration:**

```json
{
    "email": "string (email)",
    "username": "string (min 3 characters)",
    "password": "string (min 6 characters)",
    "confirmPassword": "string (min 6 characters)",
    "role": "student",
    "studentProfileData": {
        "enrollmentNumber": "string",
        "fullName": "string",
        "degreeId": "string (uuid)",
        "placementCellId": "string (uuid)"
    }
}
```

**Placement Cell Registration:**

```json
{
    "email": "string (email)",
    "username": "string (min 3 characters)",
    "password": "string (min 6 characters)",
    "confirmPassword": "string (min 6 characters)",
    "role": "placement_cell",
    "placementCellProfileData": {
        "placementCellName": "string",
        "placementCellEmail": "string (email)",
        "website": "string (url)",
        "branchId": "string (uuid)",
        "domains": ["string"],
        "degrees": ["string (uuid)"]
    }
}
```

**Recruiter Registration:**

```json
{
    "email": "string (email)",
    "username": "string (min 3 characters)",
    "password": "string (min 6 characters)",
    "confirmPassword": "string (min 6 characters)",
    "role": "recruiter",
    "recruiterProfileData": {
        "companyName": "string",
        "representativePosition": "string",
        "description": "string",
        "website": "string (url)",
        "companyEmail": "string (email)"
    }
}
```

**Response:**

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "userId": "string (uuid)",
        "username": "string",
        "email": "string",
        "role": "student | placement_cell | recruiter"
    }
}
```

### Login

```
POST /auth/login
```

**Request Body:**

```json
{
    "email": "string (email)",
    "password": "string"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Logged in successfully",
    "data": {
        "token": "string (JWT)",
        "user": {
            "userId": "string (uuid)",
            "username": "string",
            "email": "string",
            "role": "student | placement_cell | recruiter"
        }
    }
}
```

### Validate User Input

```
POST /auth/validate-user
```

**Request Body:** Same as Register User

**Response:**

```json
{
    "success": true,
    "message": "User input is valid",
    "data": {}
}
```

## Public Endpoints

### Get Branches

```
GET /branches
```

**Response:**

```json
{
    "success": true,
    "message": "Branches retrieved successfully",
    "data": [
        {
            "branchId": "string (uuid)",
            "name": "string"
        }
    ]
}
```

### Get Degrees

```
GET /degrees
```

**Response:**

```json
{
    "success": true,
    "message": "Degrees retrieved successfully",
    "data": [
        {
            "degreeId": "string (uuid)",
            "name": "string"
        }
    ]
}
```

### Get Placement Cells List

```
GET /placement_cells_list
```

**Response:**

```json
{
    "success": true,
    "message": "Placement cells retrieved successfully",
    "data": [
        {
            "placementCellId": "string (uuid)",
            "placementCellName": "string"
        }
    ]
}
```

## Students

### Get Student

```
GET /students/:id
```

**Path Parameters:**

- `id`: Student ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Response:**

```json
{
    "success": true,
    "message": "Student fetched successfully",
    "data": {
        "studentId": "string (uuid)",
        "enrollmentNumber": "string",
        "fullName": "string",
        "cgpa": "number (0-10)",
        "bachelorsGpa": "number (0-10)",
        "tenthPercentage": "number (0-100)",
        "twelfthPercentage": "number (0-100)",
        "diplomaPercentage": "number (0-100)",
        "backlogs": "number",
        "liveBacklogs": "number",
        "placementStatus": "not_placed | placed | seeking",
        "resumeUrl": "string (url)",
        "isVerifiedByPlacementCell": "boolean",
        "degree": {
            "degreeId": "string (uuid)",
            "name": "string"
        },
        "placement_cell": {
            "placementCellId": "string (uuid)",
            "placementCellName": "string"
        }
    }
}
```

### Get Students

```
GET /students
```

**Headers:**

- `Authorization`: Bearer token

**Query Parameters:**

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10)

**Response:**

```json
{
    "success": true,
    "message": "Students fetched successfully",
    "data": {
        "students": [
            {
                "studentId": "string (uuid)",
                "enrollmentNumber": "string",
                "fullName": "string",
                "cgpa": "number (0-10)",
                "bachelorsGpa": "number (0-10)",
                "tenthPercentage": "number (0-100)",
                "twelfthPercentage": "number (0-100)",
                "diplomaPercentage": "number (0-100)",
                "backlogs": "number",
                "liveBacklogs": "number",
                "placementStatus": "not_placed | placed | seeking",
                "resumeUrl": "string (url)",
                "isVerifiedByPlacementCell": "boolean",
                "degree": {
                    "degreeId": "string (uuid)",
                    "name": "string"
                },
                "placement_cell": {
                    "placementCellId": "string (uuid)",
                    "placementCellName": "string"
                }
            }
        ],
        "total": "number",
        "page": "number",
        "pageSize": "number",
        "totalPages": "number"
    }
}
```

### Update Student

```
PATCH /students/:id
```

**Path Parameters:**

- `id`: Student ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Request Body (Fields are optional):**

```json
{
    "fullName": "string",
    "enrollmentNumber": "string",
    "degreeId": "string (uuid)",
    "cgpa": "number (0-10)",
    "bachelorsGpa": "number (0-10)",
    "tenthPercentage": "number (0-100)",
    "twelfthPercentage": "number (0-100)",
    "diplomaPercentage": "number (0-100)",
    "backlogs": "number",
    "liveBacklogs": "number",
    "placementStatus": "not_placed | placed | seeking",
    "isVerifiedByPlacementCell": "boolean"
}
```

**Note:** The fields a user can update depend on their role and the student's verification status.

**Response:**

```json
{
    "success": true,
    "message": "Student updated successfully",
    "data": {
        "studentId": "string (uuid)",
        "enrollmentNumber": "string",
        "fullName": "string",
        "cgpa": "number (0-10)",
        "bachelorsGpa": "number (0-10)",
        "tenthPercentage": "number (0-100)",
        "twelfthPercentage": "number (0-100)",
        "diplomaPercentage": "number (0-100)",
        "backlogs": "number",
        "liveBacklogs": "number",
        "placementStatus": "not_placed | placed | seeking",
        "resumeUrl": "string (url)",
        "isVerifiedByPlacementCell": "boolean",
        "degree": {
            "degreeId": "string (uuid)",
            "name": "string"
        },
        "placement_cell": {
            "placementCellId": "string (uuid)",
            "placementCellName": "string"
        }
    }
}
```

### Delete Student

```
DELETE /students/:id
```

**Path Parameters:**

- `id`: Student ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Response:**

```json
{
    "success": true,
    "message": "Student deleted successfully",
    "data": null
}
```

### Batch Verify Students

```
POST /students/batch-verify
```

**Headers:**

- `Authorization`: Bearer token

**Request Body:**

```json
{
    "studentIds": ["string (uuid)"],
    "isVerifiedByPlacementCell": "boolean"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Students verification status updated successfully",
    "data": {
        "count": "number"
    }
}
```

## Placement Cells

### Get Placement Cell

```
GET /placement-cells/:id
```

**Path Parameters:**

- `id`: Placement Cell ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Response:**

```json
{
    "success": true,
    "message": "Placement cell fetched successfully",
    "data": {
        "branch": {
            "branchId": "string (uuid)",
            "name": "string"
        },
        "placementCellName": "string",
        "placementCellEmail": "string",
        "website": "string",
        "placementCellDegrees": [
            {
                "degree": {
                    "degreeId": "string (uuid)",
                    "name": "string"
                }
            }
        ],
        "placementCellDomains": [
            {
                "domain": "string"
            }
        ]
    }
}
```

### Update Placement Cell

```
PATCH /placement-cells/:id
```

**Path Parameters:**

- `id`: Placement Cell ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Request Body:**

```json
{
    "placementCellName": "string",
    "placementCellEmail": "string (email)",
    "website": "string (url)",
    "branchId": "string (uuid)",
    "domains": ["string"],
    "degrees": ["string (uuid)"]
}
```

**Response:**

```json
{
    "success": true,
    "message": "Placement cell updated successfully",
    "data": {
        "branch": {
            "branchId": "string (uuid)",
            "name": "string"
        },
        "placementCellName": "string",
        "placementCellEmail": "string",
        "website": "string",
        "placementCellDegrees": [
            {
                "degree": {
                    "degreeId": "string (uuid)",
                    "name": "string"
                }
            }
        ],
        "placementCellDomains": [
            {
                "domain": "string"
            }
        ]
    }
}
```

### Delete Placement Cell

```
DELETE /placement-cells/:id
```

**Path Parameters:**

- `id`: Placement Cell ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Response:**

```json
{
    "success": true,
    "message": "Placement cell deleted successfully",
    "data": null
}
```

### Get Student's Placement Cell

```
GET /placement-cells/student/placement-cell
```

**Headers:**

- `Authorization`: Bearer token

**Response:**

```json
{
    "success": true,
    "message": "Placement cell profile fetched successfully",
    "data": {
        "branch": {
            "branchId": "string (uuid)",
            "name": "string"
        },
        "placementCellName": "string",
        "placementCellEmail": "string",
        "website": "string",
        "placementCellDegrees": [
            {
                "degree": {
                    "degreeId": "string (uuid)",
                    "name": "string"
                }
            }
        ],
        "placementCellDomains": [
            {
                "domain": "string"
            }
        ]
    }
}
```

## Recruiters

### Get Recruiter

```
GET /recruiters/:id
```

**Path Parameters:**

- `id`: Recruiter ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Response:**

```json
{
    "success": true,
    "message": "Recruiter fetched successfully",
    "data": {
        "recruiterId": "string (uuid)",
        "companyName": "string",
        "representativePosition": "string",
        "description": "string",
        "website": "string",
        "companyEmail": "string",
        "representativeId": "string (uuid)"
    }
}
```

### Update Recruiter

```
PATCH /recruiters/:id
```

**Path Parameters:**

- `id`: Recruiter ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Request Body:**

```json
{
    "companyName": "string",
    "companyEmail": "string (email)",
    "representativePosition": "string",
    "description": "string",
    "website": "string (url)"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Recruiter updated successfully",
    "data": {
        "recruiterId": "string (uuid)",
        "companyName": "string",
        "representativePosition": "string",
        "description": "string",
        "website": "string",
        "companyEmail": "string",
        "representativeId": "string (uuid)"
    }
}
```

### Delete Recruiter

```
DELETE /recruiters/:id
```

**Path Parameters:**

- `id`: Recruiter ID (UUID)

**Headers:**

- `Authorization`: Bearer token

**Response:**

```json
{
    "success": true,
    "message": "Recruiter deleted successfully",
    "data": null
}
```

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
    "success": false,
    "message": "Error message describing what went wrong",
    "errors": {
        "field1": "Error message for field1",
        "field2": "Error message for field2"
    }
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
