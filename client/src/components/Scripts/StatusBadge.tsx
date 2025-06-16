import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusConfig = {
  draft: { label: "Draft", className: "status-draft" },
  submitted: { label: "Submitted", className: "status-submitted" },
  under_review: { label: "Under Review", className: "status-under_review" },
  approved: { label: "Approved", className: "status-approved" },
  needs_revision: { label: "Needs Revision", className: "status-needs_revision" },
  recorded: { label: "Recorded", className: "status-recorded" },
  archived: { label: "Archived", className: "status-archived" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "status-draft",
  };

  return (
    <Badge variant="secondary" className={`status-badge ${config.className}`}>
      {config.label}
    </Badge>
  );
}
