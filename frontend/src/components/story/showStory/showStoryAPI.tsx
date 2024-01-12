import axios from 'axios';

const getData = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/1.0/story/show');
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error; 
    }
};

export default getData;