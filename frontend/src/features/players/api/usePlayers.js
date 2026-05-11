import useApi from '../../../hooks/useApi';
import api from '../../../services/api';

export const usePlayers = () => {
  const { data: players, loading, error, reload } = useApi('/jugadores');

  const createPlayer = async (playerData) => {
    const res = await api.post('/jugadores', playerData, true);
    if (res.ok) {
      reload();
    }
    return res;
  };

  const deletePlayer = async (id) => {
    const res = await api.delete(`/jugadores/${id}`, true);
    if (res.ok) {
      reload();
    }
    return res;
  };

  return { players, loading, error, reload, createPlayer, deletePlayer };
};
