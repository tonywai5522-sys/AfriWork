# AfriWork Appwrite Database Design

This document defines a scalable Appwrite database design for the AfriWork platform. It includes recommended collections, fields, relationships, indexes, validation rules, security rules, and scalability considerations for an enterprise-ready SaaS system.

---

## 1. Database Strategy

### Core Principles
- Use Appwrite Database collections as domain modules.
- Keep collections normalized where appropriate and document-oriented where practical.
- Use references between documents rather than duplicating data excessively.
- Enforce role-based access control and server-side permission rules.
- Prepare for large-scale growth by designing indexes and access boundaries carefully.

### Recommended Appwrite Database Structure
- One database for the product platform
- One collection per major domain entity
- Shared metadata and audit fields in each collection

### Common Fields Across Collections
Every major collection should include:
- $id
- $createdAt
- $updatedAt
- $permissions
- status
- createdBy
- updatedBy

---

## 2. Users Collection

### Purpose
Stores core user account information and identity metadata.

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
- One user may create many projects, jobs, applications, messages, reviews, notifications, certificates, bookmarks, and activity logs
- One user may belong to many teams and organizations

### Indexes
- email unique
- username unique
- role
- status
- createdAt
- isActive

### Validation
- email must be valid email format
- username must be 3–25 characters and lowercase alphanumeric or underscore
- fullName required and max 100 characters
- role must be one of: talent, employer, admin, moderator, partner
- status must be one of: pending, active, suspended, deleted

### Security Rules
- Users can read their own document and public profile metadata
- Admins can read all users
- Users can update their own basic account fields
- Only admins can change role and status
- Sensitive fields such as email and phone should be restricted to owner and admins

### Scalability Considerations
- Separate personal data from public profile data where possible
- Use pagination for lists of users
- Consider creating a separate identity collection if the user base grows significantly

---

## 3. Profiles Collection

### Purpose
Stores user professional profile information for talent discovery and hiring.

### Fields
- $id: string
- userId: string (reference to Users)
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
- One profile may have many skills
- One profile may have many certificates and reviews

### Indexes
- userId unique
- isVerified
- availability
- experienceLevel
- location
- verificationStatus

### Validation
- userId required
- headline required max 120 characters
- bio max 2000 characters
- experienceLevel must be valid enum
- hourlyRate must be positive if present
- website and social URLs must be valid URLs

### Security Rules
- Owner can read and update their profile
- Employers and admins may read public profile fields
- Only owner and admins can update private fields

### Scalability Considerations
- Split public profile fields from private profile fields if needed
- Use computed profileCompleteness updates or background job processing

---

## 4. Skills Collection

### Purpose
Stores skills and skill metadata used by users and projects.

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
- Many users may have many skills through a join pattern or embedded references
- Many projects may require many skills
- Many jobs may require many skills

### Indexes
- name unique
- category
- slug unique
- popularityScore
- isActive

### Validation
- name required and max 100 characters
- slug required lowercase alphanumeric or hyphen
- category required

### Security Rules
- Public read for active skills
- Only admins can create or update skill taxonomy

### Scalability Considerations
- Use a controlled taxonomy for skills to avoid duplicates
- Consider a separate skill categories collection if the taxonomy becomes large

---

## 5. Projects Collection

### Purpose
Stores work projects created by users or organizations for collaboration and execution.

### Fields
- $id: string
- title: string
- description: string
- status: string
- visibility: string
- ownerId: string (reference to Users)
- organizationId: string (optional reference to Organizations)
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
- Many users may join a project via Teams or project-membership data
- A project may have many tasks, messages, reviews, and activity logs

### Indexes
- ownerId
- organizationId
- status
- visibility
- createdAt
- progress

### Validation
- title required max 150 characters
- description max 5000 characters
- status must be one of: draft, active, paused, completed, cancelled
- visibility must be one of: private, team, public
- budget must be non-negative if present

### Security Rules
- Owner and team members can read project details
- Only owner/admin/team leads can update project details
- Guests can only view public projects

### Scalability Considerations
- Break project details into separate collections for tasks, milestones, and files if needed
- Add pagination and filtering for large project lists

---

## 6. Jobs Collection

### Purpose
Stores job postings created by employers or organizations.

### Fields
- $id: string
- title: string
- description: string
- companyId: string (reference to Organizations or Users)
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
- One employer/organization posts many jobs
- A job may receive many applications
- A job may require many skills

### Indexes
- employerId
- companyId
- status
- jobType
- remote
- createdAt
- isFeatured

### Validation
- title required max 150 characters
- description required max 8000 characters
- jobType valid enum
- salary values non-negative
- deadline must be a future or present date if supplied

### Security Rules
- Public read for active jobs
- Only authenticated employer/admin users can create/update jobs
- Applicants can read job details but not edit them

### Scalability Considerations
- Use search indexing and filters for categories, location, and type
- Consider a separate collection for job applications and job tags if demand grows

---

## 7. Applications Collection

### Purpose
Stores applications from talent users to jobs or projects.

### Fields
- $id: string
- jobId: string (reference to Jobs)
- applicantId: string (reference to Users)
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
- applicantId+jobId unique

### Validation
- jobId and applicantId required
- status must be one of: pending, reviewed, accepted, rejected, withdrawn
- proposedRate positive if present

### Security Rules
- Applicant can read and update their own application
- Employer can read applications for their jobs
- Admins can read all applications

### Scalability Considerations
- Keep application lifecycle simple in MVP and expand to workflow states later
- Add audit trail if application volume grows

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
- content required for text messages
- messageType must be one of: text, file, system
- senderId and receiverId required

### Security Rules
- Only sender/receiver/admins can access messages in a conversation
- Participants can create and read messages in their conversation

### Scalability Considerations
- Separate conversations and messages into two collections if messaging volume grows
- Add pagination and message archiving for large threads

---

## 9. Teams Collection

### Purpose
Stores team membership and team-level metadata for project collaboration.

### Fields
- $id: string
- name: string
- description: string
- projectId: string (reference to Projects)
- ownerId: string (reference to Users)
- status: string
- createdAt: datetime
- updatedAt: datetime

### Relationships
- One team belongs to one project
- Many team members can be linked to the team
- Team may have many messages and activities

### Indexes
- projectId
- ownerId
- status
- createdAt

### Validation
- name required max 100 characters
- projectId required
- ownerId required

### Security Rules
- Project owner and team members can read team data
- Only owner/admin can update team details

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
- slug unique
- ownerId
- verificationStatus
- industry
- isActive

### Validation
- name required max 150 characters
- slug required lowercase alphanumeric or hyphen
- website valid URL when present

### Security Rules
- Public read for verified organizations
- Only owner/admins can edit organization data

### Scalability Considerations
- Add organization member collection if many collaborators are needed
- Keep organization verification separate from day-to-day operations

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
- recipientId required
- title and body required
- type must be a valid enum

### Security Rules
- Only recipient and admins can read notifications
- System can create notifications on behalf of users

### Scalability Considerations
- Consider archiving old notifications or moving them to a separate history store
- Add pagination and batching for large notification feeds

---

## 12. Reviews Collection

### Purpose
Stores feedback and ratings for projects, jobs, or users.

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
- reviewerId and targetId required
- rating must be between 1 and 5
- comment max 4000 characters

### Security Rules
- Users can create reviews for completed work or service delivery
- Only admins can moderate abusive reviews

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
- referenceId unique
- createdAt

### Validation
- payerId and payeeId required
- amount positive
- currency valid 3-letter code
- status valid enum

### Security Rules
- Users can read their own payment records
- Admins can read all payment records
- Payment providers may access only relevant transaction data through server-side functions

### Scalability Considerations
- Split transaction records from payout records if volume grows
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
- userId unique
- currency
- status
- balance

### Validation
- userId required
- balance non-negative
- currency must be valid 3-letter code

### Security Rules
- Only owner and admins can read/update wallet
- Wallet changes must occur through server-controlled business logic

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
- One instructor/organization creates many courses
- Courses may be linked to certificates and user activity

### Indexes
- instructorId
- organizationId
- category
- isPublished
- createdAt

### Validation
- title required max 200 characters
- description max 8000 characters
- price non-negative if present

### Security Rules
- Public read for published courses
- Only instructors/admins can create/update courses

### Scalability Considerations
- Break course content into a separate lessons collection if the catalog grows
- Add search and filtering for categories and levels

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
- verificationCode unique
- issuedAt
- status

### Validation
- userId and title required
- issuer required
- certificateUrl valid URL when present

### Security Rules
- Users can read their own certificates
- Verified public certificates can be visible to others if intended
- Admins manage certificate issuance

### Scalability Considerations
- Add a verification status workflow if certificates need formal trust signaling
- Store certificate documents in Appwrite Storage and metadata in DB

---

## 17. Bookmarks Collection

### Purpose
Stores saved jobs, projects, courses, or profiles.

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
- userId+entityType+entityId unique

### Validation
- userId and entityId required
- entityType valid enum

### Security Rules
- Users can manage their own bookmarks
- Admins can read all bookmarks if needed for moderation

### Scalability Considerations
- Keep the collection generic to support future bookmark types
- Consider separate collections if bookmark activity becomes very large

---

## 18. Activity Logs Collection

### Purpose
Stores activity records for audits, analytics, and user history.

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
- userId required
- action required
- entityType and entityId optional but if present must be valid

### Security Rules
- Users can read their own activity logs if appropriate
- Admins can read all activity logs
- Sensitive audit data should be protected tightly

### Scalability Considerations
- Archiving or partitioning may be needed as logs grow
- Store only essential metadata to reduce document size

---

## 19. Suggested Cross-Collection Relationships Summary

- Users -> Profiles (1:1)
- Users -> Skills (many:many, via reference or join metadata)
- Users -> Applications (1:many)
- Users -> Messages (1:many)
- Users -> Notifications (1:many)
- Users -> Reviews (1:many)
- Users -> Certificates (1:many)
- Users -> Bookmarks (1:many)
- Users -> Activity Logs (1:many)
- Organizations -> Jobs (1:many)
- Organizations -> Projects (1:many)
- Jobs -> Applications (1:many)
- Projects -> Teams (1:many)
- Projects -> Activity Logs (1:many)
- Courses -> Certificates (1:many)

---

## 20. Recommended Appwrite Permissions Strategy

### Public Read
Use public read only for safe content such as:
- published courses
- public organization profiles
- public skill taxonomy
- active jobs

### Private Read/Write
Use owner-only and role-based permissions for:
- user accounts
- messages
- wallets
- payment records
- notifications

### Admin Controlled
Use admin-only permissions for:
- moderation
- role management
- verification approval
- suspicious content handling

---

## 21. Indexing Recommendations

To support enterprise-scale performance:
- Index frequently filtered fields such as status, role, createdAt, location, category, and verificationState
- Create compound indexes for common lookup patterns such as:
  - userId + status
  - jobId + status
  - recipientId + isRead
  - entityType + entityId

---

## 22. Validation Recommendations

Validation should be applied at three layers:
1. Client side for a better experience
2. Backend/API side for integrity
3. Appwrite database rules for enforcement

Use consistent validation patterns for:
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
- Use server-side functions for financial actions and admin-only changes
- Audit all privileged operations
- Keep secrets and integration credentials outside the database

---

## 24. Scalability Recommendations

As the platform grows:
- Split large collections into domain-specific collections if necessary
- Use pagination and cursor-based loading for feeds and listings
- Archive older activity logs and notifications
- Add search indexes and caching for high-traffic content
- Consider moving heavy analytics and reporting workloads to a separate warehouse or analytics engine later

---

## 25. Final Recommendation
The database design above provides a strong foundation for AfriWork as a scalable digital talent and work infrastructure platform. It separates core user identity, professional profiles, work opportunities, collaboration, trust signals, payments, learning, and analytics into clear Appwrite collections while preserving security, flexibility, and performance.
