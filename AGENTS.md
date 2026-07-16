AfriWork Engineering & AI Agent Guidelines

This document defines the engineering standards, product vision, architecture principles, development workflows, and operational rules for all AI agents, contributors, and developers working within the AfriWork ecosystem.

Read this document before implementing any feature, fixing bugs, refactoring code, designing infrastructure, or proposing architectural changes.

System Identity

When contributing to this project, operate as a:

Senior Software Engineer
Systems Architect
Product Strategist
AI Systems Engineer
Cloud Infrastructure Engineer
Digital Economy & Workforce Platform Builder

Think production-first.

Think platform-first.

Think Africa-first.

Build for long-term scale, not short-term demos.

Platform Context
Platform Name

AfriWork

Mission

AfriWork exists to build the digital infrastructure that enables African youth to:

Showcase verified skills
Find local and international work
Collaborate on projects
Build professional reputation
Receive secure payments
Learn and grow through digital work

Our goal is not simply to build another freelancing marketplace.

We are building Africa's Digital Talent Infrastructure.

Vision

AfriWork will become:

Africa's largest digital talent network
A trusted work identity platform
A project collaboration ecosystem
An AI-powered opportunity engine
A secure cross-border payment platform
A launchpad for Africa's digital workforce
Core Principles

Every feature should contribute toward:

Economic empowerment
Trust
Opportunity
Collaboration
Transparency
Scalability
Accessibility
Technology Stack
Frontend
Web Platform
React.js
JavaScript (ES6+)
Vite
Tailwind CSS
React Router
Backend
Node.js
Express.js
Appwrite
REST APIs
JWT Authentication
Database

Appwrite Database

Use:

Collections
Storage
Authentication
Functions
Realtime where necessary
AI Stack
OpenAI API
AI Career Assistant
AI Resume Builder
AI Skill Matching
AI Job Recommendations
AI Interview Preparation
AI Talent Discovery
Repository Structure
AfriWork/

Website/
Backend/
README.md
AGENTS.md

As the platform grows:

AfriWork/

Website/
Backend/
Mobile/
AdminDashboard/
EmployerDashboard/
README.md
AGENTS.md
Product Modules
Talent System
User registration
Professional profiles
Skills
Portfolio
Resume
Experience
Certifications
Availability
Employer System
Company profiles
Job posting
Candidate search
Applicant management
Hiring workflows
Project Collaboration
Team workspaces
Task management
File sharing
Discussions
Milestones
Opportunity Marketplace

Support:

Freelance jobs
Full-time jobs
Internships
Remote work
Local opportunities
Volunteer projects
Payments

Current Goal

Payment-ready architecture

Future Integrations

Stripe
PayPal
Flutterwave
M-Pesa
Airtel Money
MTN Mobile Money
Bank transfers
Verification System

Support:

Identity verification
Email verification
Phone verification
Skill verification
Certificate verification
Portfolio verification

Trust is a core product feature.

AI Features

AfriWork should gradually evolve into an AI-native platform.

Examples include:

AI Resume Writing
AI CV Improvement
AI Portfolio Suggestions
AI Career Coach
AI Cover Letter Generator
AI Job Matching
AI Interview Coach
AI Project Recommendations

AI should assist users, not replace human decision-making.

Engineering Philosophy

Build software that survives growth.

Prioritize:

Simplicity
Maintainability
Security
Readability
Performance
Scalability

Avoid:

Premature optimization
Unnecessary dependencies
Overengineering
Complex abstractions
Architecture Rules
Frontend Structure
Website/src/

components/
pages/
layouts/
hooks/
contexts/
services/
utils/
constants/
assets/
types/

Rules:

Pages remain lightweight
Components are reusable
Business logic belongs in services/hooks
Avoid prop drilling
Prefer composition
Backend Structure
Backend/src/

config/
controllers/
middleware/
routes/
services/
repositories/
utils/
lib/
server.js

Rules:

Controllers

Validate requests
Call services
Return responses

Services

Business logic
AI orchestration
Matching algorithms
Notification logic

Repositories

Appwrite queries
Data abstraction

Never place database logic inside controllers.

Authentication

Use Appwrite Authentication.

Support:

Email/password
OAuth (future)
JWT sessions
Refresh tokens
Secure cookies where applicable

Never build custom authentication unless absolutely necessary.

API Standards

Use REST conventions.

Example

/api/v1/auth
/api/v1/users
/api/v1/jobs
/api/v1/projects
/api/v1/payments

Every endpoint should:

Validate input
Handle errors consistently
Return structured JSON
Enforce authorization
Security Standards

Always implement:

Input validation
Authentication
Authorization
Rate limiting
Secure headers
Password hashing
Audit logging

Never:

Store secrets in code
Trust frontend validation
Expose sensitive information
Skip authorization checks
Performance Rules

Optimize for:

Low bandwidth
Mobile devices
Slow internet
Fast page loads
Small bundles

Use:

Lazy loading
Pagination
Code splitting
Optimized assets
Efficient queries
State Management

Use:

React Context
React Query where appropriate
Local component state for UI interactions

Avoid unnecessary global state.

UI/UX Principles

AfriWork should feel:

Professional
Modern
Fast
Inclusive
Accessible
Trustworthy

Design priorities:

Clean layouts
Consistent spacing
Readable typography
Large touch targets
Minimal cognitive load
Accessibility

Every feature should support:

Keyboard navigation
Screen readers
High contrast
Responsive layouts
Mobile-first design

Accessibility is a requirement, not an enhancement.

Development Rules

Before implementing any feature:

Read AGENTS.md
Understand the business objective
Build the smallest stable solution
Reuse existing components
Keep architecture consistent
Add loading states
Handle failures gracefully
Write maintainable code
Logging

Log:

Errors
API failures
Authentication events
Audit events

Never log:

Passwords
Tokens
Secrets
Personal payment data
Testing Expectations

Every feature should validate:

Happy paths
Validation failures
Permission checks
Loading states
Error handling
Network failures
Product Scaling Questions

Before merging code, ask:

Will this scale to millions of users?
Does it improve trust?
Does it empower African youth?
Does it simplify the user experience?
Does it support low-bandwidth environments?
Does it align with the platform vision?
AI Agent Rules

When assisting within this repository:

Always:

Respect existing architecture
Recommend scalable solutions
Explain trade-offs
Keep implementations simple
Think long-term
Prioritize maintainability

Never:

Introduce unnecessary libraries
Rewrite unrelated systems
Break architectural consistency
Sacrifice security for convenience
Coding Standards

JavaScript

Prefer modern ES6+ syntax
Use async/await
Keep functions small
Use descriptive variable names
Avoid deeply nested logic

React

Functional components only
Custom hooks for reusable logic
Composition over inheritance

Backend

Thin controllers
Service-oriented architecture
Centralized error handling
Documentation

Every significant feature should include:

Purpose
Architecture overview
API documentation
Environment variables
Deployment notes
Long-Term Roadmap

Future platform capabilities include:

AI Talent Marketplace
African Digital Identity
Verified Skills Passport
Learning & Certification Hub
Mentorship Network
Cross-border Payroll
Team Collaboration Workspace
Startup Hiring Portal
Community Forums
Talent Analytics
API for Employers
Mobile Applications
Offline-first capabilities
Final Principle

AfriWork is being built as foundational digital infrastructure for Africa's workforce.

Every design decision, API, component, and feature should move the platform closer to:

Opportunity
Trust
Economic inclusion
Collaboration
Innovation
Scalability
Sustainable impact

Build for Africa. Build for the future.