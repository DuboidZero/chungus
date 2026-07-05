/**
 * Deadline entity.
 * Represents an upcoming deadline or due date surfaced on dashboards.
 */

export interface Deadline {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  /** Human-friendly label like "2 Days", "Next Week" */
  urgencyLabel: string;
  /** 'urgent' | 'normal' to control visual treatment */
  urgency: 'urgent' | 'normal';
}
