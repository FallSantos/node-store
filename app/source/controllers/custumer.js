require('dotenv').config()

const CustumerModel = require('../models/Custumer')

const md5 = require('md5')

const emailService = require('../../bin/email-service')

const authService = require('../../bin/auth')

exports.post = async (req, res, next) => {// Create

    console.log('---------------------------------')
    console.log('Time:', Date.now())
    console.log(`Request URL: ${req.originalUrl}`)
    console.log(`Request type: ${req.method}`)

    const { name, email, password } = req.body

    let custumer = new CustumerModel({
        name,
        email,
        password: md5(password + process.env.API_KEY)
    })

    try {
        // Sanva o item no banco
        await custumer.save().then(() => {
            const subject = 'Bem vindo a NodeStore!'

            const text = `Olá <strong>${name}</strong>!<br/>
                            Seja bem vindo a NodeStore.<br/> 
                            Lhe proporcionaremos as melhores experiências em compras.`

            emailService.send(email, subject, text)
        })

        res.status(200).json({ create: true })

    } catch (error) {

        res.status(500).json({
            error: error
        })
    }
}

exports.authenticate = async (req, res, next) => {// Autenticação.  

    console.log('---------------------------------')
    console.log('Time:', Date.now())
    console.log(`Request URL: ${req.originalUrl}`)
    console.log(`Request type: ${req.method}`)

    const { email, password } = req.body// Captura os dados de acesso.

    try {
        const data = await CustumerModel.findOne({// Pesquisa se ha usuários com os dados fornecidos.
            email,
            password: md5(password + process.env.API_KEY)
        })

        if (!data) {// Se não houver nenhum retorno.
            res.status(404).json({
                result: false
            })

            return // Para não proceguir com a requisição.
        }

        const token = await authService.generatedToken({
            id: data._id,
            email: data.email,
            password: data.password
        })

        res.status(200).send({// Retorna o token e os dados do usuário.
            token,
            data
        })

    } catch (error) {

        res.status(500).json({
            error: error
        })
    }
}

exports.get = async (req, res, next) => {// Read

    console.log('---------------------------------')
    console.log('Time:', Date.now())
    console.log(`Request URL: ${req.originalUrl}`)
    console.log(`Request type: ${req.method}`)

    try {
        const costumers = await CustumerModel.find({}).sort('-createdAt')// Do último pro primeiro

        res.status(200).json(costumers)

    } catch (error) {

        res.status(500).json({
            error: error
        })
    }

}

exports.getOne = async (req, res, next) => {// Read one

    console.log('---------------------------------')
    console.log('Time:', Date.now())
    console.log(`Request URL: ${req.originalUrl}`)
    console.log(`Request type: ${req.method}`)

    try {
        const custumer = await CustumerModel.find({ slug: req.params.id })

        res.status(200).json(custumer)

    } catch (error) {

        res.status(500).json({
            error: error
        })
    }
}
