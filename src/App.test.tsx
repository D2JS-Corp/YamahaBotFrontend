import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock de RobotPage que causa uso de canvas / audio
vi.mock('./pages/RobotPage', () => ({ __esModule: true, default: () => <div>Robot Page Mock</div> }));

describe('App', () => {
  it('monta sin errores en la ruta raíz', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    // La página principal es RobotPage; como no sabemos su texto, sólo verificamos que el router no cae en 404.
    expect(screen.queryByText(/404/i)).not.toBeInTheDocument();
  });

  it('muestra página 404 para ruta inexistente', () => {
    window.history.pushState({}, '', '/ruta-que-no-existe');
    render(<App />);
    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  });
});

