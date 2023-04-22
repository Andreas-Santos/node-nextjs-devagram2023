import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '@/middlewares/validarTokenJWT';
import { conectarMongoDB } from '@/middlewares/conectarMongoDB';
import { UsuarioModel } from '@/models/UsuarioModel';

const endpointPesquisa = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) => {

    try{    
        if(req.method === 'GET'){
            if(req?.query?.id){
                const usuarioEncontrado = await UsuarioModel.findById(req?.query?.id);
                if(!usuarioEncontrado){
                    return res.status(400).json({erro : 'Usuário não encontrado'});
                }

                usuarioEncontrado.senha = null;
                return res.status(200).json(usuarioEncontrado);
            }else{
                const {filtro} = req.query;
                if(!filtro || filtro.length < 2){
                    return res.status(400).json({erro : 'Favor informar ao menos 2 caracteres para efetuar a pesquisa'});
                }

                const usuariosEncontrados = await UsuarioModel.find({
                    nome : {$regex : filtro, $options : 'i'}
                });

                return res.status(200).json(usuariosEncontrados);
            }
        }

        return res.status(405).json({erro : 'O método informado não é válido'});
    }catch(e){
        console.log(e);
        return res.status(400).json({erro : 'Erro ao pesquisar usuário'});
    }
}

export default validarTokenJWT(conectarMongoDB(endpointPesquisa));