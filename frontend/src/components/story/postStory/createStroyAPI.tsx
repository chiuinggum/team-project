import axios from 'axios';

const postData = async (picUrl, purchaseUrl) => {
  try {
    const nowTime = new Date();
    const response = await axios.post('http://localhost:3000/api/1.0/story/create', {
      picUrl: picUrl,
      purchase_url: purchaseUrl,
      create_time: nowTime // 使用 toISOString() 將日期轉換為 ISO 8601 格式
    });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export default postData;
