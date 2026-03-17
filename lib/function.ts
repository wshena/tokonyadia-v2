import axios from "axios";

// Definisi tipe untuk parameter fetcher
type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type FetcherParams = Record<string, any>;

const fetcher = async (
  url: string, 
  params: FetcherParams = {}, 
  method: HttpMethod = 'get',
  data?: any,
  headers?: Record<string, string>
) => {
  try {
    const response = await axios.request({
      method,
      url,
      params,
      data,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      
      console.error('Fetcher error:', { 
        status: statusCode,
        data: responseData,
        message: error.message 
      });
      
      // Re-throw error dengan informasi yang lebih baik
      throw new Error(
        responseData?.message || 
        error.message || 
        `Request failed with status ${statusCode}`
      );
    }
    
    console.error('Unexpected fetcher error:', error);
    throw new Error('Terjadi kesalahan yang tidak terduga');
  }
};

export const GetAllProducts = async (params?: FetcherParams) => {
  return fetcher(`/api/products`, params, 'get');
};