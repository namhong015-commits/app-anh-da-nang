// Ví dụ mẫu – chỉ thay phần PORT và listen
const express = require('express');
const app = express();

// DÙNG PORT DO RAILWAY CẤP, fallback 8080 khi chạy local
const PORT = process.env.PORT || 8080;

// (tuỳ) một route test
app.get('/', (req, res) => {
  res.send('App is running!');
});

// LƯU Ý: listen trên 0.0.0.0 (không phải localhost)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});



 
