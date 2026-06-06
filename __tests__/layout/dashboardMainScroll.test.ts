import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DASHBOARD_MAIN_SCROLL_ATTR,
  scrollDashboardMainToTop,
} from '@/lib/layout/dashboardMainScroll';

describe('dashboardMainScroll', () => {
  it('marca o main rolável do DashboardShell', () => {
    const shell = readFileSync(
      join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx'),
      'utf8',
    );
    expect(shell).toContain('DASHBOARD_MAIN_SCROLL_ATTR');
    expect(shell).toMatch(/\[\s*DASHBOARD_MAIN_SCROLL_ATTR\s*\]/);
  });

  it('vitrine usa scrollDashboardMainToTop em vez de scrollIntoView', () => {
    const vitrine = readFileSync(
      join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx'),
      'utf8',
    );
    expect(vitrine).toContain('scrollDashboardMainToTop');
    expect(vitrine).not.toContain('scrollIntoView');
  });

  it('scrollDashboardMainToTop rola o main marcado', () => {
    const main = document.createElement('main');
    main.setAttribute(DASHBOARD_MAIN_SCROLL_ATTR, '');
    main.scrollTo = jest.fn();
    document.body.appendChild(main);

    scrollDashboardMainToTop('auto');

    expect(main.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    document.body.removeChild(main);
  });
});
