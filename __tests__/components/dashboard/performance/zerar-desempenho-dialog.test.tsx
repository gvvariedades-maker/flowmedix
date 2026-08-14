/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ZerarDesempenhoDialog } from '@/components/dashboard/performance/zerar-desempenho-dialog';

function renderDialog(props: Partial<Parameters<typeof ZerarDesempenhoDialog>[0]> = {}) {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const utils = render(
    <ZerarDesempenhoDialog
      open
      zerando={false}
      erro={null}
      onClose={onClose}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { ...utils, onClose, onConfirm };
}

describe('ZerarDesempenhoDialog', () => {
  it('é modal com título e descrição associados', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Zerar desempenho de estudo?');
    expect(dialog).toHaveAccessibleDescription(/simulados.*permanecem/is);
    expect(dialog).toHaveAccessibleDescription(/histórico de questões da área Estudo/i);
  });

  it('foco inicial vai para a ação segura (Cancelar)', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('ESC fecha', () => {
    const { onClose } = renderDialog();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clique no overlay fecha, clique no painel não', () => {
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('durante a operação não fecha por ESC nem por overlay', () => {
    const { onClose } = renderDialog({ zerando: true });

    fireEvent.keyDown(document, { key: 'Escape' });
    const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
    fireEvent.click(overlay);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Zerando…' })).toBeDisabled();
  });

  it('Tab circula apenas entre os botões do diálogo', () => {
    renderDialog();

    const cancelar = screen.getByRole('button', { name: 'Cancelar' });
    const confirmar = screen.getByRole('button', { name: 'Zerar desempenho de estudo' });

    confirmar.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(cancelar).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(confirmar).toHaveFocus();
  });

  it('devolve o foco ao gatilho ao fechar', () => {
    const gatilho = document.createElement('button');
    gatilho.textContent = 'Zerar desempenho de estudo';
    document.body.appendChild(gatilho);
    gatilho.focus();

    const { rerender } = render(
      <ZerarDesempenhoDialog
        open
        zerando={false}
        erro={null}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    rerender(
      <ZerarDesempenhoDialog
        open={false}
        zerando={false}
        erro={null}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(gatilho).toHaveFocus();
    gatilho.remove();
  });

  it('erro é anunciado como alerta', () => {
    renderDialog({ erro: 'Falhou' });
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
  });

  it('confirma a ação destrutiva', () => {
    const { onConfirm } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Zerar desempenho de estudo' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
