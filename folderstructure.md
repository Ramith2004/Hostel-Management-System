controllers/
    Admin/
        Hostel/
            adminComplaintResolution.controller.ts  # NEW
controllers/
    Student/  # NEW FOLDER
        studentComplaint.controller.ts  # NEW

routes/
    Admin/
        Hostel/
            complaintResolution.route.ts  # NEW
routes/
    Student/  # NEW FOLDER
        complaint.route.ts  # NEW

services/
    complaint.service.ts  # NEW
    complaintComment.service.ts  # NEW

types/
    complaint.type.ts  # NEW
    complaintComment.type.ts  # NEW

utils/
    complaint-validator.ts  # NEW (Zod schemas for validation)



src/
    Components/
        Complaints/  # NEW FOLDER
            ComplaintForm.tsx
            ComplaintCard.tsx
            ComplaintStatusBadge.tsx
            ComplaintTimeline.tsx
            ComplaintCommentSection.tsx
            ComplaintFilterBar.tsx
            PriorityIndicator.tsx

    pages/
        student/
            Complaints/  # NEW FOLDER
                SubmitComplaint.tsx
                MyComplaints.tsx
                ComplaintDetail.tsx
        admin/
            Complaints/  # NEW FOLDER
                AllComplaints.tsx
                ComplaintResolution.tsx
                ComplaintDetail.tsx
                ComplaintReports.tsx

    lib/
        complaint.api.ts  # NEW (API calls)

    hooks/
        useComplaints.ts  # NEW (Custom hook)
        useComplaintFilters.ts  # NEW