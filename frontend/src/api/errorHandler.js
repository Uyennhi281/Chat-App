export function handleApiError(error, fallbackMessage = 'API request failed') {
  if (error.response) {
    // Lỗi từ phía server (4xx, 5xx) [cite: 1163]
    console.error('API Error Response:', error.response.status, error.response.data);
  } else if (error.request) {
    // Lỗi mạng, không nhận được phản hồi [cite: 1164]
    console.error('API Network Error:', error.request);
  } else {
    // Lỗi khác [cite: 1165]
    console.error('API Error:', error.message);
  }
}