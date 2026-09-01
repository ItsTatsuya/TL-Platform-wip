## Purpose

Provide authorized staff with a coherent workspace for managing the complete course hierarchy and its activity content while preserving Django's authorization and validation rules.

## ADDED Requirements

### Requirement: Administrative authentication
The system SHALL require a valid administrative session before exposing curriculum data or mutation controls, SHALL derive user identity and permissions from the Django API, and SHALL remove local session credentials when logout succeeds or refresh can no longer restore access.

#### Scenario: Authorized staff signs in
- **WHEN** a staff user submits valid credentials and has curriculum permissions
- **THEN** the system establishes a protected session and opens the course library

#### Scenario: Session cannot be refreshed
- **WHEN** an authenticated request fails and the session cannot be refreshed
- **THEN** the system clears the session and returns the user to sign-in without displaying protected data

#### Scenario: User lacks a required permission
- **WHEN** the API denies an action because the signed-in user lacks permission
- **THEN** the system preserves the current editor state and explains that the action is not authorized

### Requirement: Course library
The system SHALL present accessible courses with their program, current status, and available versions, and SHALL allow an authorized user to create a course under an existing program.

#### Scenario: Administrator opens the course library
- **WHEN** the course request succeeds
- **THEN** the system displays each accessible course with enough program, version, and status context to select it for editing

#### Scenario: No courses exist
- **WHEN** the authenticated user can manage curriculum but no courses are accessible
- **THEN** the system displays an empty state with an available create-course action when permitted

### Requirement: Hierarchical curriculum editor
The system SHALL display the selected course as a navigable Course -> Version -> Chapter -> Subtopic -> Activity hierarchy and SHALL show an inspector appropriate to the selected record.

#### Scenario: Course structure loads
- **WHEN** an administrator selects a course
- **THEN** the system displays its versions, chapters, subtopics, and activities in API-defined display order

#### Scenario: Administrator selects a hierarchy item
- **WHEN** the administrator selects a version, chapter, subtopic, or activity
- **THEN** the inspector displays the editable fields, status, and parent context for that item

#### Scenario: Unsaved changes would be discarded
- **WHEN** an administrator attempts to select another item while the current inspector contains unsaved changes
- **THEN** the system requires the administrator to discard or retain those changes before changing selection

### Requirement: Curriculum authoring
The system SHALL allow appropriately authorized users to create and update course versions, chapters, subtopics, and activities through their individual resource endpoints, and SHALL keep new authoring records in draft status unless the user explicitly selects another permitted status.

#### Scenario: Create a child record
- **WHEN** an authorized user creates a child from a selected parent and supplies valid required fields
- **THEN** the system sends the parent's opaque identifier, creates the record, reloads the hierarchy, and selects the created record

#### Scenario: Update a record
- **WHEN** an authorized user saves valid changes in the inspector
- **THEN** the system persists only the edited resource and displays the returned canonical values

#### Scenario: API rejects submitted data
- **WHEN** the API returns field validation or domain errors
- **THEN** the system retains the submitted values and presents actionable field-level or form-level feedback

#### Scenario: Delete an eligible record
- **WHEN** an authorized user confirms deletion of a record and the API accepts it
- **THEN** the system removes the record from the hierarchy and selects its nearest surviving parent

#### Scenario: Protected record cannot be deleted
- **WHEN** the API rejects deletion because the record is referenced or protected
- **THEN** the system leaves the hierarchy unchanged and displays the API's reason

### Requirement: Ordered curriculum children
The system SHALL let authorized users reorder chapters within a version, subtopics within a chapter, and activities within a subtopic while submitting every sibling identifier exactly once.

#### Scenario: Reorder siblings
- **WHEN** an administrator commits a new sibling order
- **THEN** the system sends the complete ordered identifier list to the corresponding reorder action and displays the persisted order after success

#### Scenario: Reorder fails
- **WHEN** the reorder action rejects the proposed order
- **THEN** the system restores the last persisted order and displays an error

### Requirement: Activity content management
The system SHALL allow an authorized user to locate, create, and edit the structured content associated with a learning activity without requiring the user to enter relationship identifiers manually.

#### Scenario: Edit existing flexible content
- **WHEN** an activity has an associated activity-content record
- **THEN** the inspector loads its identifier, content type, and structured content and persists edits through that content record

#### Scenario: Add content to an activity
- **WHEN** an activity has no activity-content record and the user creates content
- **THEN** the system associates the new content record with the selected activity automatically

#### Scenario: Content contains unsupported structured fields
- **WHEN** existing content contains keys not represented by specialized editor controls
- **THEN** the system preserves those keys and provides a JSON editing fallback with validation before submission

### Requirement: Deliberate publication
The system SHALL expose course-version publication only to authorized users, SHALL identify blocking validation conditions, and SHALL require explicit confirmation before requesting publication.

#### Scenario: Publish a valid course version
- **WHEN** an authorized user confirms publication of a version whose parent program and required curriculum satisfy backend rules
- **THEN** the system requests publication and displays the canonical published course and version state

#### Scenario: Publication is blocked
- **WHEN** the backend rejects publication because prerequisites are incomplete
- **THEN** the system keeps the version unpublished and displays the blocking reason without modifying local status optimistically

### Requirement: Reliable API state
The system SHALL treat Django responses as authoritative, SHALL use opaque UUIDs without deriving identifiers, and SHALL clearly distinguish initial loading, mutation progress, empty results, and failures.

#### Scenario: Mutation succeeds
- **WHEN** a curriculum mutation returns successfully
- **THEN** the system reconciles the editor with newly fetched or returned canonical API data

#### Scenario: Course loading fails
- **WHEN** a course hierarchy request fails
- **THEN** the system displays a retryable error and does not replace the last successfully loaded hierarchy with fabricated data

### Requirement: Responsive and accessible administration
The system SHALL keep course navigation and editing usable on desktop and narrow screens, and SHALL expose interactive controls with keyboard-accessible names, focus states, and status feedback.

#### Scenario: Editor opens on a narrow screen
- **WHEN** the available viewport cannot display the hierarchy and inspector side by side
- **THEN** the system provides a navigable single-panel flow between the hierarchy and selected-item inspector without losing selection

#### Scenario: User operates the editor by keyboard
- **WHEN** a user navigates actions and hierarchy controls without a pointing device
- **THEN** focus order, visible focus, control labels, and confirmation dialogs allow the same core management operations
