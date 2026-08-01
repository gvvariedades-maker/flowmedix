/**
 * Board kit — primitivos glanceable para NeuroSlides.
 * Variants compõem estes blocos; ver docs/NEUROSLIDES_VISUAL_STRATEGY.md.
 */

export { BoardChrome, type BoardChromeProps, type BoardChromeMaxWidth } from './BoardChrome';
export { PolarityPanel, type PolarityPanelProps } from './PolarityPanel';
export { LabelBodyRow, type LabelBodyRowProps } from './LabelBodyRow';
export { CategoryStrip, type CategoryStripProps } from './CategoryStrip';
export { TwoColumnBoard, type TwoColumnBoardProps } from './TwoColumnBoard';
export { PillarDeck, type PillarDeckProps, type PillarDeckItem } from './PillarDeck';
export { ProtocolRailRow, type ProtocolRailRowProps } from './ProtocolRailRow';
export { AlertCallout, type AlertCalloutProps } from './AlertCallout';
export { CriticalNumber, type CriticalNumberProps } from './CriticalNumber';
export {
  boardTone,
  boardEmptyPlaceholder,
  BOARD_EYEBROW,
  BOARD_COLUMN_EYEBROW,
  BOARD_FOOTER,
  showBoardAuthoringHints,
  type BoardTone,
  type BoardToneClasses,
} from './boardTokens';
