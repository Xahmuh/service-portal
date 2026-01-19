# End-to-End Verification Protocol

This document outlines the manual verification steps to ensure the **Candidate Connect** platform is production-ready.

## 1. Citizen Journey (Public & Private)
- [ ] **Landing Page**:
    - Verify Hero section loads with Parliament image and animation.
    - Check "Services" and "Stats" sections for alignment and data.
    - Footer links work.
- [ ] **Registration**:
    - Click "Create New Account" / "Register".
    - Complete form with valid data (National ID 14 digits).
    - Verify redirection to Login or Dashboard after success.
- [ ] **Authentication**:
    - Log in with the newly created Citizen account.
    - Verify redirection to `/requests` or Home.
- [ ] **New Request**:
    - Navigate to `New Request`.
    - Fill out form (Title, Category, Description).
    - **Test Location**: Click "Locate Me" and verify coordinates appear.
    - **Test File Upload**: Upload a sample image/PDF.
    - Submit and check for "Success" toast.
- [ ] **Track Request**:
    - Go to `My Requests` or `Track Request`.
    - Verify the newly created request appears in the list.
    - Click to view details (Status, Replies).

## 2. Staff/Campaign Journey
- [ ] **Login**:
    - Log in with a Staff account (Role: `staff`).
- [ ] **Dashboard Access**:
    - Verify access to `/dashboard`.
    - Check "Recent Requests" widget.
    - Verify "News Management" access.
- [ ] **Request Management**:
    - Go to `Requests` tab.
    - Open the Citizen's request created in Step 1.
    - Update Status (e.g., "In Progress").
    - Add a "Staff Reply" or Note.
    - Save and verify updates.
- [ ] **News Creation**:
    - Go to `News`.
    - Create a new "Service Update".
    - Check if it appears in the list.

## 3. Admin Journey (System Owner)
- [ ] **Login**:
    - Log in with Admin account (Role: `admin`).
- [ ] **Team Management**:
    - Go to `Team`.
    - "Add Member": Invite a new user as `staff`.
    - Verify list updates.
- [ ] **System Settings**:
    - Go to `Settings` -> `System`.
    - Toggle "Maintenance Mode" (Visual check only, ensure it saves).
- [ ] **Audit & Analytics**:
    - Check `Analytics` page for charts rendering.
    - Confirm "Satisfaction" and "Response Time" metrics are visible.

## 4. Stability & Performance Checks
- [ ] **Responsive Test**: 
    - Resize browser to Mobile (375px) and Tablet (768px).
    - Ensure Navigation Menu (Hamburger) works.
    - Ensure Forms are readable/usable on small screens.
- [ ] **Error Handling**:
    - Visit a non-existent URL (e.g., `/random-page`) -> Verify "404 Not Found" page.
    - (Optional) Trigger a network error (Offline mode) and check toaster notifications.
