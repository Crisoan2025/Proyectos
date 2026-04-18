import { useState, useEffect } from 'react';

const Home = () => {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/equipos');
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      console.error('Error al cargar equipos', err);
    }
  };

  return (
    <div className="home-container" style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{ fontSize: '30px', marginRight: '15px' }}>🏆</span>
          <h2 style={{ margin: 0 }}>Standings - Regular Season 2026</h2>
        </div>
        
        <p style={{ color: '#666', marginBottom: '25px', fontSize: '15px' }}>Clasificación oficial de la liga basada en el desempeño de la temporada regular.</p>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '40%' }}>Equipo</th>
              <th>PJ</th>
              <th>W</th>
              <th>L</th>
              <th style={{ background: '#F0F0F0', color: '#333' }}>E</th>
              {/* CORRECCIÓN ACÁ: 'var(--nba-red)' con comillas */}
              <th style={{ background: 'var(--nba-red)', color: 'white' }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo, index) => (
              <tr key={equipo.id}>
                <td className="team-name">
                  <span style={{ color: '#BBB', marginRight: '10px', fontSize: '14px', fontWeight: 'normal' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {equipo.name}
                </td>
                <td style={{ textAlign: 'center' }}>{equipo.played}</td>
                <td style={{ textAlign: 'center', color: '#2e7d32', fontWeight: 'bold' }}>{equipo.won}</td>
                <td style={{ textAlign: 'center', color: '#d32f2f' }}>{equipo.lost}</td>
                <td style={{ textAlign: 'center', background: '#F9F9F9' }}>{equipo.tied}</td>
                {/* CORRECCIÓN ACÁ: 'var(--nba-blue)' con comillas */}
                <td style={{ textAlign: 'center', fontWeight: '900', fontSize: '1.2rem', color: 'var(--nba-blue)', background: '#F9F9F9' }}>
                  {equipo.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Home;