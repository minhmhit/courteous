import axiosInstance from "./axiosConfig";

const receiptAPI = {
    //lấy tất cả phiếu thu
    getAllReceipts: async () => {
        return await axiosInstance.get("/receipts/");
    }

};

export default receiptAPI;