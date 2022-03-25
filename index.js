const express = require('express')
const agentes = require('./data/agentes.js')
const app = express()
app.listen(3000, () => console.log('UP'))
const jwt = require('jsonwebtoken')

const secretKey = 'Mi llave Ultra Secreta'

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})


// 1. Crear una ruta que autentique a un agente basado en sus credenciales y genera un
// token con sus datos.

app.get('/token', (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, data) => {
        res.send( err ? 'Token invalido' : data );
    });
});

app.get('/SignIn', (req, res) => {
    const { email, password } = req.query;
    const agente = agentes.results.find((u) => u.email == email && u.password == password);
    if (agente) { 
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: agente,
            },
            secretKey
        );

        // 2. Al autenticar un agente, devolver un HTML que:
        //     ● Muestre el email del agente autorizado.
        //     ● Guarde un token en SessionStorage con un tiempo de expiración de 2
        //     minutos.
        //     ● Disponibiliza un hiperenlace para redirigir al agente a una ruta restringida.
        
        res.send(`
        <a href="/Casos?token=${token}"> <p> Sus casos </p> </a>
        Agente ${email}, autorizado.
        <script>
        sessionStorage.setItem('token', JSON.stringify('${token}'))
        </script>
        `);
    } else {
        res.send('Usuario o contraseña incorrecta');
    }
});

// 3. Crear una ruta restringida que devuelva un mensaje de Bienvenida con el correo del
// agente autorizado, en caso contrario devolver un estado HTTP que indique que el
// usuario no está autorizado y un mensaje que menciona la descripción del error.
app.get('/Casos', (req,res) => {
    let { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        err
            ? res.status(401).send({
                error: '401 No autorizado',
                message: err.message,
            })
            :
                res.send(`
                Bienvenido sus casos, agente ${decoded.data.email}
                `);
    });
});