import useApi from '../../../hooks/useApi';
import api from '../../../services/api';

export const useMatches = () => {
  const { data: matches, loading, error, reload } = useApi('/partidos');

  const createMatch = async (matchData) => {
    const res = await api.post('/partidos', matchData, true);
    if (res.ok) {
      reload();
    }
    return res;
  };

  const updateMatchScore = async (id, scoreData) => {
    const res = await api.post(`/partidos/${id}/resultado`, scoreData, true);
    if (res.ok) {
      reload();
    }
    return res;
  };

  const deleteMatch = async (id) => {
    const res = await api.del(`/partidos/${id}`, true);
    if (res.ok) {
      reload();
    }
    return res;
  };

  return { matches, loading, error, reload, createMatch, updateMatchScore, deleteMatch };
};
