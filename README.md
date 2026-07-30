# DISCISCAN: A digital disciplinary records and monitoring system using QR code.

Overall Scope

A web-based system (accessible on mobile and desktop browsers) for recording student violations, monitoring visitors, tracking office compliance, and — as a secondary feature — logging student attendance, all built around QR code scanning. It explicitly does not include biometric auth, GPS tracking, or offline operation, and requires internet connectivity.

Users (Actors)

1. Admin — has full system access, no direct QR scanning duties
2. Security Guard — the main field operator, does all scanning and recording
3. Student — indirect user, identified only via QR code (no login)
4. Visitor — indirect user, self-registers online and is identified via QR code (no login)

Features per User

Admin

Manage User Accounts: add, update, delete users; role-based access control; login/session management
View Records: view student violations, attendance, and visitor records; search/filter records
Generate Reports: create disciplinary, attendance, and visitor reports; filter by date/category; export/print/download
View Compliance Records: view, search, and filter compliance history (shared with Guard)
Access an Admin Dashboard interface for all of the above

Security Guard

Scan QR Code: scan student/visitor codes via device camera, verify validity, retrieve and route info
Record Student Attendance: log time-in/time-out via QR scan
Record Violation: select violation type (e.g., incomplete uniform, no ID), auto-timestamp, save to database
Resolve Student Violation: view recorded violations, update status to resolved
Record Visitor Entry & Exit: scan visitor QR code, log entry/exit time
Monitor Compliance: record office/classroom observations (lights, computers, equipment left on)
View Compliance Records (shared with Admin)

Student (no login — passive/identified user)

Gets scanned for attendance and violation recording
Info (profile, photo) displayed for verification when their QR code is scanned

Visitor (no login — self-service registration only)

Scans a registration QR code → fills out an online form (name, purpose of visit, etc.)
System validates entries and auto-generates a unique personal QR code for that visitor
That QR code is then used by guards for entry/exit scanning
System Workflow

A. Visitor Registration & QR Generation

Visitor scans a pre-generated registration QR → opens online form
Visitor enters personal info + purpose of visit
System validates the input (shows error and re-prompts if invalid)
System generates a unique QR code and stores visitor info + QR in the database
QR code is displayed/printed for the visitor to use on campus

B. QR Code Scanning & Recording (Students/Visitors)

Guard opens the QR scanning module on their device
Scans the student's or visitor's QR code
System looks up the record in the database
If no match: shows "No Data Found," guard rescans
If matched: displays profile info (name, photo, details)
Guard proceeds to the relevant action:
Attendance → time-in/out is logged
Violation → guard selects violation type, system auto-timestamps and saves
System validates and stores the update in the database

C. Violation Resolution

Guard opens violation records, reviews an existing entry
Updates status to "resolved"
System validates and saves the update

D. Compliance Monitoring

Guard physically observes an area (office/classroom/lab)
Records compliance issues (e.g., equipment left on)
System validates and stores the entry

E. Admin Oversight

Admin logs in, manages user accounts (add/update/delete, role assignment)
Views consolidated records (violations, attendance, visitor logs, compliance)
Generates/filters/exports reports for documentation and decision-making
