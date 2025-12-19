require('../db');
const Product = require('../models/products');
Product.findOne().then(p=>{ console.log(p? String(p._id): 'none'); process.exit(0);}).catch(e=>{console.error(e); process.exit(1);});