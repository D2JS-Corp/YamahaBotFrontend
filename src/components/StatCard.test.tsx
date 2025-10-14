import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { Battery } from 'lucide-react';

describe('StatCard', () => {
  it('muestra título y valor', () => {
    render(<StatCard title="Batería" value="95%" icon={Battery} />);
    expect(screen.getByText('Batería')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('muestra trend cuando se provee', () => {
    render(<StatCard title="Velocidad" value="1.2m/s" trend="+0.1" icon={Battery} />);
    expect(screen.getByText('+0.1')).toBeInTheDocument();
  });
});
