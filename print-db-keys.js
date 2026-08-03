console.log("Checking DB variables in process.env...");
console.log(Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('PG') || k.includes('CONN')));
