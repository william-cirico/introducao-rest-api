import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";

// Criando a instância do express
const app = express();

// Configurando o CORS
// npm i cors
app.use(cors({
    origin: "*"
}));

// Adicionado o middleware para leitura do body
app.use(express.json());

const criptografarSenha = (senha: string) => {
    // npm i bcrypt
    // npm i -D @types/bcrypt
    return bcrypt.hashSync(senha, 10);
};

const sanitizarDadosUsuario = (usuario: Usuario) => {
    const { senha, ...usuarioSanitizado } = usuario;
    return usuarioSanitizado;
}

// Criando a tipagem do usuário
type Usuario = {
    id: number;
    nome: string;
    email: string;
    senha: string;
};

// Criando o banco de dados em memória
const usuarios: Usuario[] = [
    { id: 1, nome: "William", email: "william@email.com", senha: "123456" }
];

// Rotas da API
app.get("/", (req, res) => {
    res.json({ message: "API está rodando..." });
});

/* 
v1 -> Indica a versão da API
- Quando os dados da requisição mudar, a versão precisa ser atualizada.
*/
app.get("/v1/usuarios", (req, res) => {
    // Sanitizando usuários
    /*
    Como funciona o map:
    const numeros = [1, 2, 3, 4]; -> [2, 4, 6, 8]
    []
    [2]
    [2, 4]
    [2, 4, 6]
    [2, 4, 6, 8]
    const numerosDuplicados = numeros.map(numero => numero * 2);
    */
    const usuariosSanitizados = usuarios.map(usuario => sanitizarDadosUsuario(usuario));

    res.json(usuariosSanitizados);
});

app.get("/v1/usuarios/:id", (req, res) => {
    // Obter o parâmetro da URL
    const id = +req.params.id;

    // Buscando o usuário no banco de dados
    const usuario = usuarios.find(usuario => usuario.id === id);

    // Verificando se o usuário existe
    if (!usuario) {
        res.status(404).json({ message: `O usuário com o ID ${id} não foi encontrado` });
        return;
    }

    // Sanitizando dados
    const usuarioSanitizado = sanitizarDadosUsuario(usuario);

    res.json(usuarioSanitizado);
});

app.post("/v1/usuarios", (req, res) => {
    // Validar os dados do cadastro
    const camposObrigatorios = ["nome", "email", "senha"];
    const camposNaoInformados = camposObrigatorios.filter(campo => !req.body[campo]);

    // Verificando se existe campos não informados
    if (camposNaoInformados.length > 0) {
        res.status(400).json({ 
            message: `Parâmetros não informados: ${camposNaoInformados.join(", ")}` 
        });
        return;
    }

    // Criando o usuário com os valores do body
    const usuario: Usuario = {
        id: (usuarios[usuarios.length - 1]?.id ?? 0) + 1,
        nome: req.body.nome,
        email: req.body.email,
        senha: criptografarSenha(req.body.senha)
    };

    // Adicionando usuário no banco de dados
    usuarios.push(usuario);

    // Sanitizando usuário
    const usuarioSanitizado = sanitizarDadosUsuario(usuario);

    // Retornando o usuário criado
    res.status(201).json(usuarioSanitizado);
});

app.delete("/v1/usuarios/:id", (req, res) => {
    // Obtendo o ID da rota
    const id = +req.params.id;

    // Encontrando a posição do usuário no vetor
    const indiceUsuario = usuarios.map(usuario => usuario.id).indexOf(id);

    // Verificando se o usuário existe
    if (indiceUsuario === -1) {
        res.status(404).json({ message: `Usuário com o ID ${id} não foi encontrado` });
        return;
    }

    // Removendo o usuário do banco
    usuarios.splice(indiceUsuario, 1);

    res.status(204).end();
});


// Definir a porta da API
const PORTA = 8080;

// Rodando o servidor
app.listen(PORTA, () => {
    console.log(`O servidor de desenvolvimento está rodando em: http://localhost:${PORTA}`);
});