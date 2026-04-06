import axiosInstance from "./axiosConfig";

const receiptAPI = {
    //lấy tất cả phiếu thu
    getAllReceipts: async () => {
        return await axiosInstance.get("/receipts/");
    },

    getReceiptsByOrderId: async (orderId) => {
        return await axiosInstance.get(`/receipts/order/${orderId}`);
    }

};

export default receiptAPI;
