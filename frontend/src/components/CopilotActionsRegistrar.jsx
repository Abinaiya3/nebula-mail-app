import { useCopilotMailActions } from '../hooks/useCopilotMailActions';

/**
 * This component simply registers CopilotKit actions.
 * It must live inside <Router> (to use useNavigate via MailContext) and inside <CopilotKit>.
 */
export default function CopilotActionsRegistrar({ children }) {
  useCopilotMailActions();
  return children;
}
