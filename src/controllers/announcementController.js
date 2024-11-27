const AnunciosDAO = require("../models/DAO/announcementsDAO");

class AnunciosController {

     async getAllAnuncios(req, reply) {
        try {
            const anuncios = await AnunciosDAO.getAllAnuncios();
            reply.status(200).send(anuncios)
        } catch (err) {
            reply.status(500).send({ server: `We catch an unxpected error during the GET Method: ${err}` });
            console.log(err);
        };
    };

     async postAnuncios(req, reply) {
        const {title, content, createdById, type, createdByPhoto, createdByName, ...anunciosData} = req.body;
        try{
           const newAnuncio = await AnunciosDAO.createAnuncios(
            {...anunciosData, 
            title, //1
            content, //2
            type, //3
            createdById, //4 
            createdByPhoto, //5
            createdByName //6
        });
           if(!title){
            reply.status(500).send({ server: `Missing the title` });
        };
        if(!type){
            reply.status(500).send({ server: `Missing the type` });
        };
        if(!content){
            reply.status(500).send({ server: `Missing the content` });
        };
        if(!createdById){
            reply.status(500).send({ server: `Missing the createdById` });
        }; 
           reply.status(201).send(newAnuncio);
        }catch (err) {
            console.log(err);
            
            reply.status(500).send({ server: `We catch an unxpected error during the POST Method: ${err}` });
        };
    };


    async getAnuncioByType(req, reply){
        try{
            const {type} =  req.query;
            if(!type) {
                reply.status(400).send({server:"You need to pass the type"});
                return
            }
            const userByType = await AnunciosDAO.getUsersByType(type);
            if (!userByType) {
                reply.status(404).send({ server: "No announcements found for the provided type" });
                return;
            }
            reply.status(200).send(userByType);
        } catch(err){
            throw new Error(`We catch an expected error to get the annuncments: ${err}`);
        };
    };

    async deleteAnuncio(req, reply) {
        const id = Number(req.params.id);
        try{
            await AnunciosDAO.deleteAnuncios(id);
            reply.status(204).send({server:"No content"});
        } catch (err) {
            reply.status(500).send({ server: `We catch an unxpected error during the POST Method: ${err}` });
            console.log(err);
        };
    };

    async putAnuncio(req, reply) {
        const id = Number(req.params.id);
        try{
            const updatedAnuncio = await AnunciosDAO.updateAnuncios(id);
            reply.status(202).send(updatedAnuncio);
        } catch (err) {
            reply.status(500).send({ server: `We catch an unxpected error during the POST Method: ${err}` });
            console.log(err);
        };
    };

    async getAnuncioById(req, reply) {
        const id = Number(req.params.id);
        try {
            const specifiedAnuncio = await AnunciosDAO.getAnunciosById(id);
            if (specifiedAnuncio){
                reply.status(200).send(specifiedAnuncio);
                console.log(id);
                
            } else{
                reply.status(400).send({server:"The Anuncio does not exist"});
                console.log(id);
            };
        }catch (err) {
            reply.status(500).send({ server: `We catch an unxpected error during the POST Method: ${err}` });
            console.log(err);
        };
    }
};

module.exports = new AnunciosController;