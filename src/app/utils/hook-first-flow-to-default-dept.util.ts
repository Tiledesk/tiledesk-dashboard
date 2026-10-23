import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';

/**
 * After creating a flow: if GET /faq_kb/ has exactly one bot (this is the first active flow),
 * silently attach it to the project's default department so the widget can answer.
 * Skips webhook / copilot (not widget-routed the same way).
 * Fire-and-forget — does not block opening the Design Studio.
 */
export function hookFirstFlowToDefaultDepartment(
  faqKbService: FaqKbService,
  departmentService: DepartmentService,
  botId: string,
  subtype?: string,
): void {
  if (!botId) {
    return;
  }
  const sub = (subtype || 'chatbot').toLowerCase();
  if (sub === 'webhook' || sub === 'copilot') {
    return;
  }

  faqKbService.getFaqKbByProjectId().subscribe({
    next: (bots: any[]) => {
      if (!Array.isArray(bots) || bots.length !== 1) {
        return;
      }
      departmentService.getDeptsByProjectId().subscribe({
        next: (departments: any[]) => {
          const defaultDept = (departments || []).find((d) => d && d.default === true);
          if (!defaultDept || !defaultDept._id) {
            return;
          }
          departmentService.updateExistingDeptWithSelectedBot(defaultDept._id, botId).subscribe({
            error: () => { /* silent */ },
          });
        },
        error: () => { /* silent */ },
      });
    },
    error: () => { /* silent */ },
  });
}
