import { TIMEOUT_SEC } from "./config.js";
const timeout = function (TIMEOUT_SEC) {
  return new Promise(function (_, reject) {
    setTimeout(() => {
      reject(
        new Error(`Request took too long! Timeout after ${TIMEOUT_SEC} seconds`)
      );
    }, TIMEOUT_SEC * 1000);
  });
};



export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`💣💣${data.message}`);
    return data;
  } catch (err) {
    throw err;
  }
};


export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers:{
        'Content-Type':'application/json',
      },
      body:JSON.stringify(uploadData),
    });
    
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
  
    const data = await res.json();
    if (!res.ok) throw new Error(`💣💣${data.message}`);
    return data;
  } catch (err) {
    throw err;
  }
};