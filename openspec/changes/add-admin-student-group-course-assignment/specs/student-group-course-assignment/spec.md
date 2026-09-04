## Purpose

Enable authorized staff to deliver a selected course version to an academic cohort and keep member enrollments consistent with active group assignments.

## ADDED Requirements

### Requirement: Assign a versioned course to a student group
The system SHALL allow a user with course-assignment permission to select an accessible course, select one of that course's versions, optionally provide a due date, and create an active assignment for a student group.

#### Scenario: Assign a course version successfully
- **WHEN** an authorized user submits a group, course, matching course version, and optional due date
- **THEN** the system records the group assignment and creates active enrollments for eligible current group members who do not already have one

#### Scenario: Version does not belong to course
- **WHEN** the selected course version does not belong to the selected course
- **THEN** the system rejects the assignment and creates neither the assignment nor any enrollment

#### Scenario: User lacks assignment permission
- **WHEN** a user without course-assignment permission views a group
- **THEN** the system omits the assign-course control while still showing assignments the user is permitted to view

### Requirement: Atomic initial enrollment synchronization
Creating a group course assignment SHALL be atomic and SHALL not leave a partial assignment or partial set of enrollments when any targeted student has a conflicting active enrollment for another version of the same course.

#### Scenario: Members have no conflicting enrollment
- **WHEN** every current member either has no active enrollment for the course or is already enrolled in the selected version
- **THEN** the system commits the assignment, creates only missing enrollments, and preserves matching existing enrollments

#### Scenario: A member has a conflicting version
- **WHEN** any current member has an active enrollment in another version of the selected course
- **THEN** the system rolls back the assignment and all enrollment mutations and identifies the conflict to the administrator

#### Scenario: Group has no members
- **WHEN** an authorized user assigns a valid course version to an empty group
- **THEN** the system records the active assignment with zero initial enrollments and reports that no current students were enrolled

### Requirement: Synchronize students added after assignment
Adding a student to a group SHALL create any missing active enrollments required by that group's active course assignments in the same atomic operation.

#### Scenario: New member inherits active assignments
- **WHEN** an eligible student joins a group with active course assignments and has no conflicting enrollment
- **THEN** the system commits the membership and creates missing active enrollments for each assigned course version

#### Scenario: New member has a conflicting course version
- **WHEN** a student being added has an active enrollment for a different version of a course actively assigned to the group
- **THEN** the system creates neither the membership nor any new enrollment and explains the conflicting course and version

#### Scenario: New member already has matching enrollment
- **WHEN** a student joins a group and already has an active enrollment matching one of its assignments
- **THEN** the system preserves the existing enrollment and completes the membership without duplication

### Requirement: Membership removal preserves enrollment
Removing a student from a group SHALL NOT automatically cancel, expire, or delete an enrollment created through a group assignment.

#### Scenario: Assigned member leaves a group
- **WHEN** an authorized user removes a student who has enrollments associated with the group's assignments
- **THEN** the system removes only the membership and leaves those enrollments unchanged

### Requirement: Assignment history and outcomes
The system SHALL display the selected group's accessible course assignments with course, version, status, assignment time, assigner context when available, and optional due date, and SHALL communicate the outcome of new assignments.

#### Scenario: Administrator reviews assignments
- **WHEN** the group detail workspace loads successfully
- **THEN** the system displays current and previous accessible assignments in a distinguishable status order

#### Scenario: Assignment completes
- **WHEN** an assignment and its enrollment synchronization succeed
- **THEN** the system confirms the assignment and states how many missing enrollments were created and how many matching enrollments already existed

#### Scenario: Assignment fails validation
- **WHEN** assignment creation fails because of invalid input or an enrollment conflict
- **THEN** the system retains the administrator's selections and displays actionable feedback without showing a successful assignment

