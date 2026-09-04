## Purpose

Provide authorized staff with an accessible administration workspace for organizing students into academic cohorts and maintaining each cohort's operational details and membership.

## ADDED Requirements

### Requirement: Permission-aware student-group navigation
The system SHALL expose the student-group workspace only to authenticated users who can view student groups, and SHALL show mutation controls only when the user has the corresponding student-group management permission.

#### Scenario: Authorized user opens student groups
- **WHEN** an authenticated user with student-group viewing permission selects Student groups from the Learners navigation
- **THEN** the system displays the student-group workspace and the groups visible to that user

#### Scenario: User lacks management permission
- **WHEN** a user can view student groups but lacks student-group management permission
- **THEN** the system displays available group information without create, edit, add-member, or remove-member controls

#### Scenario: Backend rejects an operation
- **WHEN** the backend denies a student-group operation
- **THEN** the system leaves persisted data unchanged and displays an authorization error without exposing credentials or protected data

### Requirement: Student-group directory
The system SHALL list each accessible student group with its name, unique code, grade, academic year, teacher context when available, status, and member count, and SHALL provide meaningful loading, empty, and failure states.

#### Scenario: Groups load successfully
- **WHEN** the student-group request succeeds
- **THEN** the system displays every accessible group with enough identifying and status context to select it

#### Scenario: No groups exist
- **WHEN** no student groups are accessible
- **THEN** the system displays an empty state and offers group creation when the user is permitted

#### Scenario: Group loading fails
- **WHEN** the student-group request fails
- **THEN** the system displays an actionable error and permits the user to retry

### Requirement: Create and maintain student groups
The system SHALL allow an authorized user to create and update a student group using a name, unique code, optional grade, academic year, optional teacher, and status, while preserving server validation feedback.

#### Scenario: Create a valid student group
- **WHEN** an authorized user submits valid group details
- **THEN** the system creates the group and opens or displays its canonical saved details

#### Scenario: Group details are invalid
- **WHEN** submitted group details violate required-field, unique-code, teacher-role, or other server rules
- **THEN** the system retains the submitted values and displays actionable validation feedback

#### Scenario: Update group status
- **WHEN** an authorized user changes a group's details or lifecycle status and the backend accepts the update
- **THEN** the system displays the returned canonical group values

### Requirement: Manage group membership
The system SHALL let an authorized user inspect current members, add eligible students without creating duplicate memberships, and remove an existing membership after confirmation.

#### Scenario: Add an eligible student
- **WHEN** an authorized user selects a student who belongs to the student role and is not already a member
- **THEN** the system adds the membership and refreshes the displayed member list and count

#### Scenario: Student is already a member
- **WHEN** an authorized user attempts to add a student who already belongs to the group
- **THEN** the system preserves one membership and displays the canonical member state without duplicating the student

#### Scenario: Add an ineligible user
- **WHEN** the selected user does not belong to the student role
- **THEN** the system rejects the membership and explains that only eligible students can join

#### Scenario: Remove a member
- **WHEN** an authorized user confirms removal of an existing group member
- **THEN** the system removes the membership, refreshes the member list, and does not implicitly cancel the student's existing course enrollments

### Requirement: Responsive and accessible group administration
The student-group directory, forms, member controls, errors, and confirmation interactions SHALL remain keyboard operable and usable without page-level horizontal overflow on narrow and wide viewports.

#### Scenario: Manage a group on a narrow viewport
- **WHEN** the student-group workspace is used on a narrow viewport
- **THEN** group details, member lists, and primary actions remain readable and reachable in a single-column flow

#### Scenario: Manage membership with a keyboard
- **WHEN** a keyboard user adds or removes a student
- **THEN** every required control has an accessible name, focus remains predictable, and success or error feedback is announced

