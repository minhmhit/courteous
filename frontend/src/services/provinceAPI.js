import axios from "axios";

const PROVINCE_API_BASE_URL = "https://provinces.open-api.vn/api/v1";

/**
 * Lấy danh sách tất cả tỉnh thành Việt Nam
 * @returns {Promise} Danh sách tỉnh thành
 */
export const getAllProvinces = async () => {
  try {
    const response = await axios.get(`${PROVINCE_API_BASE_URL}/p/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
};

/**
 * Lấy danh sách quận/huyện theo mã tỉnh
 * @param {number} provinceCode - Mã tỉnh
 * @returns {Promise} Thông tin tỉnh và danh sách quận/huyện
 */
export const getDistrictsByProvince = async (provinceCode) => {
  try {
    const response = await axios.get(
      `${PROVINCE_API_BASE_URL}/p/${provinceCode}?depth=2`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
};

/**
 * Lấy danh sách phường/xã theo mã quận/huyện
 * @param {number} districtCode - Mã quận/huyện
 * @returns {Promise} Thông tin quận và danh sách phường/xã
 */
export const getWardsByDistrict = async (districtCode) => {
  try {
    const response = await axios.get(
      `${PROVINCE_API_BASE_URL}/d/${districtCode}?depth=2`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching wards:", error);
    throw error;
  }
};

const provinceAPI = {
  getAllProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
};

export default provinceAPI;
