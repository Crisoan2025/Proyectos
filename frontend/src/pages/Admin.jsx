import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  // --- ESTADOS ---
  const [equipos, setEquipos] = useState([]);
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [entrenador, setEntrenador] = useState('');

  // --- NUEVOS ESTADOS DE PARTIDOS ---
  const [partidos, setPartidos] = useState([]);
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('20:00'); // Hora por defecto
  const [lugar, setLugar] = useState('');
  const [editandoPartidoId, setEditandoPartidoId] = useState(null); // Para saber si creamos o editamos

  const [jugadores, setJugadores] = useState([]);
  const [jugadorNombre, setJugadorNombre] = useState('');
  const [jugadorApellido, setJugadorApellido] = useState('');
  const [jugadorCategoria, setJugadorCategoria] = useState('Senior');
  const [jugadorEquipoId, setJugadorEquipoId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      cargarEquipos();
      cargarPartidos(); 
      cargarJugadores();
    }
  }, [navigate]);

  const cargarEquipos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/equipos');
      const data = await res.json();
      setEquipos(data);
    } catch (err) { console.error(err); }
  };

  const cargarPartidos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/partidos');
      const data = await res.json();
      setPartidos(data);
    } catch (err) { console.error(err); }
  };

  const cargarJugadores = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/jugadores');
      const data = await res.json();
      setJugadores(data);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- MAGIA: AUTOCOMPLETAR ESTADIO ---
  const handleLocalChange = (e) => {
    const equipoSeleccionadoId = e.target.value;
    setLocalId(equipoSeleccionadoId);
    
    // Buscamos el equipo en nuestra lista para sacarle el estadio
    const equipo = equipos.find(eq => eq.id == equipoSeleccionadoId);
    if (equipo && equipo.stadium) {
      setLugar(equipo.stadium);
    }
  };

  // --- FUNCIONES DE PARTIDOS ---
  const handleCrearOEditarPartido = async (e) => {
    e.preventDefault();
    if (localId === visitanteId) return alert('Falta técnica: Un equipo no puede jugar contra sí mismo.');
    const token = localStorage.getItem('token');
    
    const url = editandoPartidoId 
      ? `http://localhost:3000/api/partidos/${editandoPartidoId}` 
      : 'http://localhost:3000/api/partidos';
    const method = editandoPartidoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          local_team_id: localId, 
          visitor_team_id: visitanteId, 
          match_date: fecha, 
          match_time: hora, 
          location: lugar 
        })
      });

      if (res.ok) {
        // Limpiamos el formulario
        setLocalId(''); setVisitanteId(''); setFecha(''); setHora('20:00'); setLugar(''); setEditandoPartidoId(null);
        cargarPartidos(); 
        alert(editandoPartidoId ? '¡Partido actualizado!' : '¡Partido programado!');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) { console.error(err); }
  };

  const iniciarEdicion = (partido) => {
    // Llenamos el formulario con los datos del partido seleccionado
    setEditandoPartidoId(partido.id);
    setLocalId(partido.local_team_id);
    setVisitanteId(partido.visitor_team_id);
    // Extraemos solo la parte YYYY-MM-DD de la fecha para el input
    setFecha(partido.match_date.split('T')[0]); 
    setHora(partido.match_time || '20:00');
    setLugar(partido.location || '');
  };

  const handleBorrarPartido = async (id) => {
    if (!window.confirm("¿Seguro que querés cancelar y borrar este partido?")) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:3000/api/partidos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      cargarPartidos(); 
    } catch (err) { console.error(err); }
  };

  const handleCargarResultado = async (id) => {
    const puntosLocal = window.prompt("Ingresá los puntos del equipo LOCAL:");
    const puntosVisitante = window.prompt("Ingresá los puntos del equipo VISITANTE:");
    if (!puntosLocal || !puntosVisitante) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/partidos/${id}/resultado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ local_points: parseInt(puntosLocal), visitor_points: parseInt(puntosVisitante) })
      });
      if (res.ok) {
        alert('¡Resultado guardado!'); cargarPartidos(); cargarEquipos();  
      } else { 
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Hubo un error'}`); 
      }
    } catch (err) { console.error(err); }
  };

  // --- DEMÁS FUNCIONES (Jugadores y Equipos se mantienen igual) ---
  const handleCrearEquipo = async (e) => { /* Igual que antes, acá podrías sumar un input para crear estadio también si quisieras */
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/equipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: nombreEquipo, coach_name: entrenador, stadium: 'Estadio ' + nombreEquipo })
      });
      if (res.ok) {
        setNombreEquipo(''); setEntrenador(''); cargarEquipos(); alert('¡Equipo fichado!');
      }
    } catch (err) { console.error(err); }
  };

  const handleCrearJugador = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/jugadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: jugadorNombre, surname: jugadorApellido, category: jugadorCategoria, team_id: jugadorEquipoId })
      });
      if (res.ok) {
        setJugadorNombre(''); setJugadorApellido(''); setJugadorCategoria('Senior'); setJugadorEquipoId('');
        cargarJugadores(); alert('¡Jugador fichado con éxito!');
      }
    } catch (err) { console.error(err); }
  };

  const handleBorrarJugador = async (id) => {
    if (!window.confirm("¿Dar de baja a este jugador?")) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:3000/api/jugadores/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      cargarJugadores(); 
    } catch (err) { console.error(err); }
  };

  // ==========================================
  // RENDERIZADO VISUAL
  // ==========================================
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      
      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--nba-black)', color: 'white', padding: '15px 25px', borderRadius: '8px', borderBottom: '4px solid var(--nba-red)' }}>
        <h2 style={{ margin: 0, color: 'white', border: 'none' }}>⚙️ PANEL VIP</h2>
        <button onClick={handleLogout} style={{ background: 'var(--nba-red)', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>🚪 CERRAR SESIÓN</button>
      </div>

      {/* FILA DE FORMULARIOS */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        
        {/* Inscribir Equipo */}
        <div className="card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>➕ INSCRIBIR EQUIPO</h3>
          <form onSubmit={handleCrearEquipo} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Nombre" value={nombreEquipo} onChange={(e) => setNombreEquipo(e.target.value)} required />
            <input type="text" placeholder="DT" value={entrenador} onChange={(e) => setEntrenador(e.target.value)} />
            <button type="submit" style={{ background: '#e65100', color: 'white', padding: '12px' }}>GUARDAR EQUIPO</button>
          </form>
        </div>

        {/* Programar Partido (AHORA CON HORA Y LUGAR) */}
        <div className="card" style={{ flex: 1, minWidth: '300px', border: editandoPartidoId ? '2px solid var(--nba-red)' : 'none' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', borderBottomColor: editandoPartidoId ? 'var(--nba-red)' : 'var(--nba-blue)' }}>
            {editandoPartidoId ? '✏️ EDITAR PARTIDO' : '📅 PROGRAMAR PARTIDO'}
          </h3>
          <form onSubmit={handleCrearOEditarPartido} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select value={localId} onChange={handleLocalChange} required>
              <option value="">Seleccionar Local...</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
            <select value={visitanteId} onChange={(e) => setVisitanteId(e.target.value)} required>
              <option value="">Seleccionar Visitante...</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={{ flex: 2 }} />
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required style={{ flex: 1 }} />
            </div>
            
            <input type="text" placeholder="Estadio / Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} required />

            <button type="submit" style={{ background: editandoPartidoId ? 'var(--nba-red)' : 'var(--nba-blue)', color: 'white', padding: '12px' }}>
              {editandoPartidoId ? 'ACTUALIZAR PARTIDO' : 'PROGRAMAR'}
            </button>
            {editandoPartidoId && (
              <button type="button" onClick={() => { setEditandoPartidoId(null); setLocalId(''); setVisitanteId(''); setFecha(''); setHora('20:00'); setLugar(''); }} style={{ background: '#777', color: 'white', padding: '8px', marginTop: '-5px' }}>
                CANCELAR EDICIÓN
              </button>
            )}
          </form>
        </div>

        {/* Fichar Jugador */}
        <div className="card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', borderBottomColor: '#2e7d32' }}>🏃‍♂️ FICHAR JUGADOR</h3>
          <form onSubmit={handleCrearJugador} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Nombre" value={jugadorNombre} onChange={(e) => setJugadorNombre(e.target.value)} required style={{ flex: 1 }} />
              <input type="text" placeholder="Apellido" value={jugadorApellido} onChange={(e) => setJugadorApellido(e.target.value)} required style={{ flex: 1 }} />
            </div>
            <select value={jugadorCategoria} onChange={(e) => setJugadorCategoria(e.target.value)}>
              <option value="Senior">Senior</option>
              <option value="Junior">Junior</option>
            </select>
            <select value={jugadorEquipoId} onChange={(e) => setJugadorEquipoId(e.target.value)} required>
              <option value="">¿A qué equipo va?</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
            <button type="submit" style={{ background: '#2e7d32', color: 'white', padding: '12px' }}>FICHAR</button>
          </form>
        </div>

      </div>

      {/* FILA DE TABLAS */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        
        {/* Tabla Jugadores (Se mantiene igual) */}
        <div className="card" style={{ flex: 1, minWidth: '400px' }}>
          <h3 style={{ borderBottomColor: '#2e7d32', marginBottom: '15px' }}>📋 ROSTER</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Jugador</th>
                <th>Cat.</th>
                <th style={{ textAlign: 'left' }}>Equipo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jugadores.map((jug) => (
                <tr key={jug.id}>
                  <td className="team-name">{jug.name} {jug.surname}</td>
                  <td style={{ textAlign: 'center', fontSize: '12px' }}>{jug.category}</td>
                  <td style={{ fontSize: '14px', color: '#555' }}>{jug.team_name || 'Agente Libre'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleBorrarJugador(jug.id)} style={{ background: '#d32f2f', color: 'white', padding: '5px', fontSize: '10px' }}>BAJA</button>
                  </td>
                </tr>
              ))}
              {jugadores.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay jugadores registrados.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Tabla Partidos (AHORA CON LUGAR, HORA, EDITAR Y BORRAR) */}
        <div className="card" style={{ flex: 1, minWidth: '500px' }}>
          <h3 style={{ borderBottomColor: 'var(--nba-blue)', marginBottom: '15px' }}>🏆 FIXTURE Y RESULTADOS</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Cuándo / Dónde</th>
                <th>Encuentro</th>
                <th>Score</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {partidos.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: '12px', color: '#777', textAlign: 'center' }}>
                    <strong>{new Date(p.match_date).toLocaleDateString()} - {p.match_time || '20:00'}</strong> <br/>
                    📍 {p.location || 'Estadio Central'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--nba-black)' }}>{p.local_name}</div>
                    <div style={{ color: p.status === 'jugado' ? 'var(--nba-red)' : '#999', fontWeight: '900', margin: '4px 0' }}>
                      {p.status === 'jugado' ? `${p.local_points} - ${p.visitor_points}` : 'VS'}
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--nba-black)' }}>{p.visitor_name}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.status !== 'jugado' ? (
                      <button onClick={() => handleCargarResultado(p.id)} style={{ background: '#4caf50', color: 'white', padding: '6px 12px', fontSize: '11px' }}>Cargar</button>
                    ) : (
                      <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '12px' }}>FINAL</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.status !== 'jugado' && (
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button onClick={() => iniciarEdicion(p)} style={{ background: '#f57c00', color: 'white', padding: '5px', fontSize: '12px' }}>✏️</button>
                        <button onClick={() => handleBorrarPartido(p.id)} style={{ background: '#d32f2f', color: 'white', padding: '5px', fontSize: '12px' }}>🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {partidos.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay partidos programados.</td></tr>}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Admin;