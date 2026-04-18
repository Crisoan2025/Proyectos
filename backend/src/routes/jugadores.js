const express = require('express'); // Importa la librería Express para crear el servidor web
const router = express.Router(); // Crea una instancia de enrutador Express para manejar las rutas
const verificarToken = require('../middlewares/authMiddleware'); // Importa el middleware de autenticación para verificar tokens JWT
const { obtenerJugadores, crearJugador, editarJugador, borrarJugador } = require('../controllers/jugadoresController'); // Importa los controladores con las funciones lógicas para gestionar jugadores

router.get('/', obtenerJugadores); // Define ruta GET para obtener la lista de todos los jugadores
router.post('/', verificarToken, crearJugador); // Define ruta POST para crear un nuevo jugador (requiere autenticación)
router.put('/:id', verificarToken, editarJugador); // Define ruta PUT para actualizar un jugador específico por ID (requiere autenticación)
router.delete('/:id', verificarToken, borrarJugador); // Define ruta DELETE para eliminar un jugador específico por ID (requiere autenticación)

module.exports = router; // Exporta el enrutador para que pueda ser utilizado en otros archivos