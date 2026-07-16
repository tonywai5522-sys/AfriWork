# AfriWork Backend Appwrite Database Design

This document defines a complete Appwrite database schema for the AfriWork backend. It is designed for a scalable digital talent platform that supports users, organizations, work opportunities, collaboration, payments, learning, and trust signals.

---

## 1. Database Strategy

### Recommended Structure
- One Appwrite database for the platform
- One collection per major domain entity
- Shared metadata fields in each collection
- Relationships implemented with Appwrite document references where appropriate
- Server-side functions used for sensitive actions such as payments and role changes

### Common Fields Across Collections
Every major collection should include:
- $id
- $createdAt
- $updatedAt
- $permissions
- status
- createdBy
- updatedBy

### Naming Conventions
- Use lowercase snake_case for field names in API payloads
- Use singular collection names for domain entities
- Keep IDs as Appwrite document IDs

---

## 2. Users Collection

### Purpose
Stores core identity and account information for every platform user.

### Fields
- $id: string
- email: string
- phone: string
- fullName: string
- username: string
- avatarUrl: string
- role: string
- status: string
- emailVerified: boolean
- phoneVerified: boolean
- isActive: boolean
- lastLoginAt: datetime
- createdAt: datetime
- updatedAt: datetime
- deletedAt: datetime
- metadata: object

### Relationships
- One user has one profile
- One user may have many skills
- One user may create many projects, jobs, applications, messages, notifications, reviews, certificates, bookmarks, and activity logs
- One user may belong to many teams and organizations

### Indexes
- email: unique
- username: unique
- role
- status
- createdAt
- isActive

### Validation
- email must be a valid email format
- username must be 3–25 characters and contain lowercase alphanumeric characters or underscores
- fullName is required and max 100 characters
- role must be one of: talent, employer, admin, moderator, partner
- status must be one of: pending, active, suspended, deleted

### Security Rules
- Users can read their own account data and public profile metadata
- Admins can read all users
- Users can update their own basic info
- Only admins can change role and status
- Sensitive fields such as email and phone are restricted to owner and admins

### Scalability Considerations
- Keep sensitive personal data separate from public profile data
- Use pagination for user list endpoints
- Introduce a separate identity collection later if the user base grows significantly

---

## 3. Profiles Collection

### Purpose
Stores professional profile information for talent discovery and hiring.

### Fields
- $id: string
- userId: string
- headline: string
- bio: string
- location: string
- timezone: string
- experienceLevel: string
- availability: string
- website: string
- linkedinUrl: string
- githubUrl: string
- portfolioUrl: string
- resumeUrl: string
- profileCompleteness: number
- isVerified: boolean
- verificationStatus: string
- preferredWorkType: string
- hourlyRate: number
- currency: string
- createdAt: datetime
- updatedAt: datetime

### Relationships
- Many profiles belong to one user
- One profile may be related to many skills, certificates, and reviews

### Indexes
- userId: unique
- isVerified
- availability
- experienceLevel
- location
- verificationStatus

### Validation
- userId is required
- headline is required and max 120 characters
- bio max 2000 characters
- experienceLevel must be a valid enum
- hourlyRate must be positive if present
- website and social URLs must be valid URLs

### Security Rules
- Owners can read and update their profile
- Employers and admins may read public profile fields
- Only owner and admins can update private fields

### Scalability Considerations
- Split public profile fields from private fields if data volume grows
- Use background jobs or computed updates for profile completeness

---

## 4. Skills Collection

### Purpose
Stores reusable skill taxonomy values used by users, projects, and jobs.

### Fields
- $id: string
- name: string
- category: string
- slug: string
- description: string
- popularityScore: number
- isActive: boolean
- createdAt: datetime
- updatedAt: datetime

### Relationships
- Many users may have many skills through reference links or join metadata
- Many projects may require many skills
- Many jobs may require many skills

### Indexes
- name: unique
- category
- slug: unique
- popularityScore
- isActive

### Validation
- name is required and max 100 characters
- slug is required and must be lowercase alphanumeric or hyphen-separated
- category is required

### Security Rules
- Public read for active skills
- Only admins can create or update the skill taxonomy

### Scalability Considerations
- Maintain a controlled taxonomy to avoid duplicates
- Introduce a separate categories collection if the taxonomy grows significantly

---

## 5. Projects Collection

### Purpose
Stores collaborative work projects created by users or organizations.

### Fields
- $id: string
- title: string
- description: string
- status: string
- visibility: string
- ownerId: string
- organizationId: string
- startDate: datetime
- endDate: datetime
- budget: number
- currency: string
- progress: number
- createdAt: datetime
- updatedAt: datetime

### Relationships
- One owner user creates many projects
- One organization may own many projects
- Many users can be linked to a project via team or membership data
- A project may have many messages, reviews, and activity logs

### Indexes
- ownerId
- organizationId
- status
- visibility
- createdAt
- progress

### Validation
- title is required and max 150 characters
- description max 5000 characters
- status must be one of: draft, active, paused, completed, cancelled
- visibility must be one of: private, team, public
- budget must be non-negative if present

### Security Rules
- Owners and team members can read project details
- Only owners, admins, and team leads can update project details
- Guests can view public projects only

### Scalability Considerations
- Split project tasks, milestones, and files into separate collections if needed
- Add pagination and filtering for large project lists

---

## 6. Jobs Collection

### Purpose
Stores job opportunities posted by employers or organizations.

### Fields
- $id: string
- title: string
- description: string
- companyId: string
- employerId: string
- location: string
- remote: boolean
- jobType: string
- experienceLevel: string
- salaryMin: number
- salaryMax: number
- currency: string
- status: string
- deadline: datetime
- isFeatured: boolean
- createdAt: datetime
- updatedAt: datetime

### Relationships
- One employer or organization posts many jobs
- One job may receive many applications
- One job may require many skills

### Indexes
- employerId
- companyId
- status
- jobType
- remote
- createdAt
- isFeatured

### Validation
- title is required and max 150 characters
- description is required and max 8000 characters
- jobType must be a valid enum
- salary values must be non-negative
- deadline must be today or later if supplied

### Security Rules
- Active jobs can be publicly readable
- Only authenticated employer or admin users can create or update jobs
- Applicants can read job details but cannot edit them

### Scalability Considerations
- Use search indexing and filters for location, type, and category
- Introduce a separate job-tags or job-categories collection if demand grows

---

## 7. Applications Collection

### Purpose
Stores applications submitted by talent users to jobs or projects.

### Fields
- $id: string
- jobId: string
- applicantId: string
- coverLetter: string
- status: string
- proposedRate: number
- currency: string
- appliedAt: datetime
- updatedAt: datetime

### Relationships
- Many applications belong to one job
- Many applications belong to one applicant

### Indexes
- jobId
- applicantId
- status
- appliedAt
- applicantId + jobId: unique

### Validation
- jobId and applicantId are required
- status must be one of: pending, reviewed, accepted, rejected, withdrawn
- proposedRate must be positive if present

### Security Rules
- Applicants can read and update their own applications
- Employers can read applications for their jobs
- Admins can read all applications

### Scalability Considerations
- Keep the transition workflow simple in MVP and expand later if needed
- Add an audit trail if application volume becomes large

---

## 8. Messages Collection

### Purpose
Stores direct messages and conversation content.

### Fields
- $id: string
- conversationId: string
- senderId: string
- receiverId: string
- content: string
- messageType: string
- attachmentUrl: string
- isRead: boolean
- createdAt: datetime
- updatedAt: datetime

### Relationships
- Many messages belong to one conversation
- Sender and receiver are users

### Indexes
- conversationId
- senderId
- receiverId
- isRead
- createdAt

### Validation
- content is required for text messages
- messageType must be one of: text, file, system
- senderId and receiverId are required

### Security Rules
- Only conversation participants and admins can access messages
- Participants can create and read messages in their conversation

### Scalability Considerations
- Split conversations and messages into separate collections if messaging volume grows
- Add pagination and archiving for large threads

---

## 9. Teams Collection

### Purpose
Stores team metadata and membership context for project collaboration.

### Fields
- $id: string
- name: string
- description: string
- projectId: string
- ownerId: string
- status: string
- createdAt: datetime
- updatedAt: datetime

### Relationships
- One team belongs to one project
- Many team members can be linked to the team
- A team may have many messages and activities

### Indexes
- projectId
- ownerId
- status
- createdAt

### Validation
- name is required and max 100 characters
- projectId is required
- ownerId is required

### Security Rules
- Project owners and team members can read team data
- Only owner or admin users can update team details

### Scalability Considerations
- Use a separate team_members collection if membership logic becomes complex
- Keep team metadata lightweight and separate from project content

---

## 10. Organizations Collection

### Purpose
Stores employer, institution, or partner organizations.

### Fields
- $id: string
- name: string
- slug: string
- description: string
- website: string
- logoUrl: string
- industry: string
- location: string
- verificationStatus: string
- ownerId: string
- isActive: boolean
- createdAt: datetime
- updatedAt: datetime

### Relationships
- One owner user manages one organization
- An organization may have many users, jobs, projects, and reviews

### Indexes
- slug: unique
- ownerId
- verificationStatus
- industry
- isActive

### Validation
- name is required and max 150 characters
- slug is required and must be lowercase alphanumeric or hyphen-separated
- website must be a valid URL when present

### Security Rules
- Public read for verified organizations
- Only owners and admins can edit organization data

### Scalability Considerations
- Add a separate organization members collection if collaboration grows
- Keep verification state separate from day-to-day operations

---

## 11. Notifications Collection

### Purpose
Stores in-app and system notifications for users.

### Fields
- $id: string
- recipientId: string
- senderId: string
- type: string
- title: string
- body: string
- entityType: string
- entityId: string
- isRead: boolean
- createdAt: datetime

### Relationships
- One recipient user has many notifications
- One sender user may trigger many notifications

### Indexes
- recipientId
- isRead
- createdAt
- type

### Validation
- recipientId is required
- title and body are required
- type must be a valid enum

### Security Rules
- Only recipient and admins can read notifications
- System functions can create notifications on behalf of users

### Scalability Considerations
- Archive older notifications or move them to a history store later
- Use pagination and batching for large notification feeds

---

## 12. Reviews Collection

### Purpose
Stores feedback and ratings for users, projects, jobs, or organizations.

### Fields
- $id: string
- reviewerId: string
- targetType: string
- targetId: string
- rating: number
- comment: string
- status: string
- createdAt: datetime
- updatedAt: datetime

### Relationships
- A reviewer user writes many reviews
- Reviews belong to a target entity such as a user, project, or organization

### Indexes
- reviewerId
- targetType
- targetId
- rating
- status
- createdAt

### Validation
- reviewerId and targetId are required
- rating must be between 1 and 5
- comment max 4000 characters

### Security Rules
- Users can create reviews for completed work or services
- Only admins can moderate abusive or suspicious reviews

### Scalability Considerations
- Aggregate ratings into profile or organization summaries for faster reads
- Prevent duplicate review spam with uniqueness rules

---

## 13. Payments Collection

### Purpose
Stores payment transactions and billing records.

### Fields
- $id: string
- payerId: string
- payeeId: string
- amount: number
- currency: string
- paymentMethod: string
- status: string
- referenceId: string
- metadata: object
- createdAt: datetime
- updatedAt: datetime

### Relationships
- A payment is linked to payer and payee users
- Used for invoices, escrow, or marketplace transactions

### Indexes
- payerId
- payeeId
- status
- referenceId: unique
- createdAt

### Validation
- payerId and payeeId are required
- amount must be positive
- currency must be a valid 3-letter code
- status must be a valid enum

### Security Rules
- Users can read their own payment records
- Admins can read all payment records
- Payment providers may access only relevant transaction data through server-side functions

### Scalability Considerations
- Separate transaction records from payout records if volume grows
- Store immutable transaction history rather than updating records in place

---

## 14. Wallet Collection

### Purpose
Stores user wallet balances and financial state.

### Fields
- $id: string
- userId: string
- balance: number
- currency: string
- status: string
- lastTransactionAt: datetime
- createdAt: datetime
- updatedAt: datetime

### Relationships
- One wallet belongs to one user

### Indexes
- userId: unique
- currency
- status
- balance

### Validation
- userId is required
- balance must be non-negative
- currency must be a valid 3-letter code

### Security Rules
- Only owner and admins can read or update wallet data
- Wallet changes must happen through server-controlled business logic

### Scalability Considerations
- Keep wallet balances in a dedicated ledger or transaction-based model for auditability
- Avoid direct client-side wallet updates

---

## 15. Courses Collection

### Purpose
Stores learning content, programs, or training courses.

### Fields
- $id: string
- title: string
- description: string
- instructorId: string
- organizationId: string
- category: string
- level: string
- isPublished: boolean
- thumbnailUrl: string
- price: number
- currency: string
- createdAt: datetime
- updatedAt: datetime

### Relationships
- One instructor or organization creates many courses
- Courses may be linked to certificates and user activity

### Indexes
- instructorId
- organizationId
- category
- isPublished
- createdAt

### Validation
- title is required and max 200 characters
- description max 8000 characters
- price must be non-negative if present

### Security Rules
- Published courses can be publicly readable
- Only instructors and admins can create or update courses

### Scalability Considerations
- Split course content into a lessons collection if the learning catalog grows
- Add search and filtering for category, level, and price

---

## 16. Certificates Collection

### Purpose
Stores credentials and certification records for users.

### Fields
- $id: string
- userId: string
- courseId: string
- title: string
- issuer: string
- issuedAt: datetime
- expiresAt: datetime
- certificateUrl: string
- verificationCode: string
- status: string
- createdAt: datetime
- updatedAt: datetime

### Relationships
- Many certificates belong to one user
- A certificate may relate to one course

### Indexes
- userId
- courseId
- verificationCode: unique
- issuedAt
- status

### Validation
- userId and title are required
- issuer is required
- certificateUrl must be a valid URL when present

### Security Rules
- Users can read their own certificates
- Public verification can be allowed for trusted certificates
- Admins manage certificate issuance and moderation

### Scalability Considerations
- Store certificate documents in Appwrite Storage and metadata in the database
- Add formal verification workflows if certificates become a trust feature

---

## 17. Bookmarks Collection

### Purpose
Stores saved jobs, projects, courses, or profiles for later access.

### Fields
- $id: string
- userId: string
- entityType: string
- entityId: string
- createdAt: datetime

### Relationships
- A bookmark belongs to one user
- Bookmarks can point to different domain entities

### Indexes
- userId
- entityType
- entityId
- userId + entityType + entityId: unique

### Validation
- userId and entityId are required
- entityType must be a valid enum

### Security Rules
- Users can manage their own bookmarks
- Admins can read bookmarks if moderation is necessary

### Scalability Considerations
- Keep the collection generic for future bookmark types
- Split into specialized bookmark collections if usage becomes very large

---

## 18. Activity Logs Collection

### Purpose
Stores audit, analytics, and user activity records.

### Fields
- $id: string
- userId: string
- action: string
- entityType: string
- entityId: string
- metadata: object
- ipAddress: string
- createdAt: datetime

### Relationships
- One user may have many activity log entries

### Indexes
- userId
- action
- entityType
- createdAt

### Validation
- userId is required
- action is required
- entityType and entityId are optional but should be validated when present

### Security Rules
- Users can read their own activity logs if appropriate
- Admins can read all logs
- Sensitive audit data should be tightly protected

### Scalability Considerations
- Archive or partition older logs as volume increases
- Store only essential metadata to keep documents lightweight

---

## 19. Cross-Collection Relationship Summary

- Users -> Profiles: 1:1
- Users -> Skills: many:many through reference or join metadata
- Users -> Applications: 1:many
- Users -> Messages: 1:many
- Users -> Notifications: 1:many
- Users -> Reviews: 1:many
- Users -> Certificates: 1:many
- Users -> Bookmarks: 1:many
- Users -> Activity Logs: 1:many
- Organizations -> Jobs: 1:many
- Organizations -> Projects: 1:many
- Jobs -> Applications: 1:many
- Projects -> Teams: 1:many
- Projects -> Activity Logs: 1:many
- Courses -> Certificates: 1:many

---

## 20. Recommended Appwrite Permission Strategy

### Public Read
Use public read for safe content such as:
- published courses
- public organization profiles
- public skill taxonomy
- active jobs

### Private Read/Write
Use owner-only and role-based permissions for:
- user accounts
- messages
- wallets
- payments
- notifications

### Admin Controlled
Use admin-only permissions for:
- moderation
- role changes
- verification approval
- security-sensitive actions

---

## 21. Indexing Recommendations

To support strong performance at scale:
- Index frequently filtered fields such as status, role, createdAt, location, category, and verificationStatus
- Add compound indexes for common access patterns such as:
  - userId + status
  - jobId + status
  - recipientId + isRead
  - entityType + entityId

---

## 22. Validation Recommendations

Validation should be enforced at three layers:
1. Client-side validation for a better experience
2. Backend/API validation for integrity
3. Appwrite database rules for enforcement

Use consistent rules for:
- required fields
- enum values
- length limits
- URL formats
- numeric ranges
- date ordering

---

## 23. Security Recommendations

- Enforce access rules based on user identity and role
- Avoid exposing sensitive fields to anonymous users
- Use server-side functions for financial operations and admin-only changes
- Audit privileged operations
- Keep secrets and integration credentials outside the database

---

## 24. Scalability Recommendations

As the platform grows:
- Split large collections into domain-specific collections if necessary
- Use pagination and cursor-based loading for feeds and listings
- Archive old activity logs and notifications
- Add search indexes and caching for high-traffic content
- Consider moving analytics or reporting workloads to a separate warehouse later

---

## 25. Final Recommendation

This schema gives AfriWork a strong foundation for a scalable and secure digital talent platform. It separates user identity, professional profiles, work opportunities, collaboration, trust signals, payments, learning, and analytics into clear Appwrite collections while preserving security, flexibility, and performance.
