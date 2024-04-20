exports.getDate = (date, hourss = false) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  if (hourss) {
    return `${day}-${month}-${year}  ${hours}:${minute}:${second}`;
  } else {
    return `${year}-${month}-${day}`;
  }
};

exports.isPhoneNumber = (number) => {
  return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
};

exports.randomNum = () => {
  let num = '';
  for(let i = 0; i < 6; i++) {
   num += Math.floor(Math.random() * 10);
  }
  return num;
}

exports.ramdomOrder = () => {
  const result = Math.random().toString(36).substring(2,7); 
  return result;
}
