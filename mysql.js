// var mysql = require('mysql2/promise');
const mysql = require('sync-mysql');
const connection  = new mysql({
    host: "ossw10jo-database.c0e4aijkeltd.us-east-1.rds.amazonaws.com",
    port: 3306,
    user: "ossw10jo",
    password: "ossw10jo",
    database: "ossw10jo",
});


// const pool = mysql.createPool({
//     host: "ossw10jo-database.c0e4aijkeltd.us-east-1.rds.amazonaws.com",
//     port: 3306,
//     user: "ossw10jo",
//     password: "ossw10jo",
//     database: "ossw10jo",
// });
//
// async function name() {
//     const conn = await pool.getConnection(async conn => conn);
//     const nameSql = "select name from restaurant";
//     const [sqlName] = await conn.query(nameSql);
//     //return sqlName;
//     return (sqlName);
//     // console.log(sqlName);
// };
//
// async function address() {
//     const conn = await pool.getConnection(async conn => conn);
//     const addressSql = "select address from restaurant";
//     const [sqlAddress] = await conn.query(addressSql);
//     //return sqlName;
//     return (sqlAddress);
//     // console.log(sqlName);
// }

// async function category() {
//     const conn = await pool.getConnection(async conn => conn);
//     const categorySql = "select category from category";
//     const [sqlCategory] = await conn.query(categorySql);
//     //return sqlName;
//     return (sqlCategory);
//     // console.log(sqlName);
// }

// name().
//     then((name) => {
//         console.log(name[0].name);
// });
//
// address().
//     then((address) => {
//         console.log(address);
// });
//
// category().
//     then((category) => {
//         console.log(category);
// });


// module.exports = {
//     name,
//     address,
//     category,
// };
// connection.connect();
//
let restaurant_table = connection.query('select restaurant.*, category.category from restaurant inner join category on restaurant.seq = category.seq');
let menu_table = connection.query('select * from menu');
let schoolfood_table = connection.query('select * from school');


module.exports = {
    restaurant_table,
    menu_table,
    schoolfood_table
}
//
//
// connection.end();
