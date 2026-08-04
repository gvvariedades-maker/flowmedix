/**
 * Shells premium de logic_flow — Focus · Isolate · Rail.
 * Convergência Fase A+B: IDs de layout_variant permanecem; miolo compartilha shell.
 * @see docs/NEUROSLIDES_VISUAL_STRATEGY.md Camada 4 + Onda shells
 */

export {
  LogicFocusShell,
  type LogicFocusShellProps,
  type LogicFocusHeaderContext,
} from './LogicFocusShell';
export {
  LogicRailShell,
  type LogicRailShellProps,
} from './LogicRailShell';
export {
  LogicIsolateShell,
  type LogicIsolateShellProps,
} from './LogicIsolateShell';
export {
  LetterEliminationRail,
  letterEliminationFromSteps,
  letterStepsFromPtRoles,
  type LetterEliminationRailProps,
  type LetterEliminationStep,
} from './LetterEliminationRail';
export {
  RomanVfStatusRail,
  romanVfStatusFromSteps,
  type RomanVfStatusRailProps,
  type RomanVfItemStatus,
} from './RomanVfStatusRail';
export {
  FOCUS_ACCENTS,
  PROTOCOL_SHELL_ACCENTS,
  focusStepTitle,
  type LogicFlowShellAccent,
} from './focusAccents';
