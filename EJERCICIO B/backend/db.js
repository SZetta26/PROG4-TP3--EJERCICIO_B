import 'dotenv/config'; 
import mysql from "mysql2/promise";

let dbConnection = null;

export async function conectarDB() {
    try {
        dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD, 
            database: process.env.DB_NAME,
        });
        console.log('Conexión a la base de datos establecida correctamente.');
        return dbConnection;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error.message);
        throw error; 
    }
}

export function getDb() {
    if (!dbConnection) {
        throw new Error("La conexión a la base de datos no ha sido inicializada. Error.");
    }
    return dbConnection;
}