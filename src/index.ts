import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TuserDB } from './database/types'


const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})


// ... configurações do express

app.get("/ping", async (req: Request, res: Response) => {
    try {
				const result = await db("users")
        res.status(200).send({ message: "Pong!"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string || undefined //searchTerm = termo de busca
        
        if(searchTerm === undefined){
            const result = await db("users")
        res.status(200).send(result)

        }else{
        const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
        res.status(200).send(result)
        }

		
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        const {id, name, email, password} = req.body
        if(typeof id !== "string") {// 0 false undefined null "" NaN             res.status(400)
            throw new Error ("id deve ser string")
        }

    
        if(id.length < 4) {
            res.status(400)
            throw new Error ("id deve possuir pelo menos 4 caracteres")
        }

        if(typeof name !== "string") {// 0 false undefined null "" NaN             res.status(400)
            throw new Error ("name deve ser string")
        }

    
        if(name.length < 2) {
            res.status(400)
            throw new Error ("name deve possuir pelo menos 2 caracteres")
        }

        if(typeof email !== "string") {// 0 false undefined null "" NaN             res.status(400)
            res.status(400)
            throw new Error ("email deve ser string")
        }

    
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}
    
		const [userIdAlreadyExists]: TuserDB[] | undefined[] = await db("users").where({id})

        if (userIdAlreadyExists) {
            res.status(400)
            throw new Error ("id já existe")
        }

        const [userEmailAlreadyExists]: TuserDB[] | undefined[] = await db("users").where({email})
        if (userEmailAlreadyExists) {
            res.status(400)
            throw new Error ("email já existe")
        }

        const newUser: TuserDB = {
            id,
            name,
            email,
            password
        }
        
        await db("users").insert(newUser)

        res.status(201).send({
            message: "user criado com sucesso",
            user: newUser
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        const [userIdAlreadyExists]: TuserDB[] | undefined[] = await db("users").where({id : idToDelete})
        
        if (userIdAlreadyExists) {
            res.status(404)  //404 recurso nao encontrado
            throw new Error ("id não encontrado")
        }

        await db("users").del().where({id: idToDelete})

        res.status(200).send({message: "user deletado com sucesso"})
        //status 200 significa estado de sucesso

        
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})