import api from './api';
import { API_ROUTES } from './api';

export const fetchBuildings = async () => {
  try {
    const response = await api.get(API_ROUTES.HOSTEL_BUILDINGS);
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch buildings');
  }
};

export const fetchFloors = async (buildingId: string) => {
  try {
    const response = await api.get(`${API_ROUTES.HOSTEL_FLOORS}/building/${buildingId}`);
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch floors');
  }
};

export const fetchAvailableRooms = async (floorId: string) => {
  try {
    const response = await api.get(`${API_ROUTES.HOSTEL_ROOMS}?floorId=${floorId}&available=true`);
    // Extract rooms array from response
    const roomsData = response.data.data?.rooms || response.data.rooms || [];
    return Array.isArray(roomsData) ? roomsData : [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch rooms');
  }
};