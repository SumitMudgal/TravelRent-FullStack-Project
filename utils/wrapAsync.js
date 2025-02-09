module.exports = (fn) => {
    return (req, res, next) => {
         fn(req, res, next).catch(next);
    }
};

/*
Wrap Async ka format kuch aisa hota hai ki,
Ye ek Function hota hai, 
Jiske parameter me Ek aur function pass karte hai i.e. "fn" here.
Aur Iss function ke Body me hum "return" karte hai Ek aur Function with parameters "req, res, next" . Aur iski body me apan wohi Parameter wala function CALL karte hai with same arguments "req, res, next". Aur iss function call ke saath ".catch(next" likhte hai, Matlab agar Error occur hua, to wo catch karle aur  conrol ko "next" ko paas karde.

Isse Agar Error occur bhi hua , tobhi wo Handle hojayega, aur Server Crash/Off/loading nahi hoga.

*/












