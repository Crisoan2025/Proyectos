import useApi from '../../../hooks/useApi';
import api from '../../../services/api';

export const useTeams = (queryString = '') => {
  const endpoint = `/equipos${queryString}`;
  const { data: teams, loading, error, reload } = useApi(endpoint);

  const createTeam = async (teamData) => {
    const res = await api.post('/equipos', teamData, true);
    if (res.ok) {
      reload();
    }
    return res;
  };

  const deleteTeam = async (id) => {
    const res = await api.del(`/equipos/${id}`, true);
    if (res.ok) {
      reload();
    }
    return res;
  };

  return { teams, loading, error, reload, createTeam, deleteTeam };
};
