import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import { UsuarioModel } from '@/models/UsuarioModel';
import { SeguidorModel } from '@/models/SeguidorModel';
import { validarTokenJWT } from '@/middlewares/validarTokenJWT';
import { conectarMongoDB } from '@/middlewares/conectarMongoDB';

const endpointSeguir = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    try{
        if(req.method === 'PUT'){
            const {userId, id} = req?.query;

            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuário logado não encontrado'});
            }

            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro : 'Usuário a ser seguido não encontrado'});
            }

            // verifica se o usuário logado já segue o outro usuário
            const jaSegueEsseUsuario = await SeguidorModel
                .find({usuarioId : usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            
            if(jaSegueEsseUsuario && jaSegueEsseUsuario.length > 0){
                //usuário logado já segue o outro usuário
                jaSegueEsseUsuario.forEach(async (e : any) => await SeguidorModel.findOneAndDelete({_id : e._id}));

                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Usuário deixado de seguir com sucesso'});
            }else{
                //usuário logado ainda não segue o outro usuário
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                }

                await SeguidorModel.create(seguidor);

                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Usuário seguido com sucesso'});
            }
        }

        return res.status(405).json({erro : 'O método informado não é válido'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Não foi possível seguir/desseguir o usuário'});
    }
}

export default validarTokenJWT(conectarMongoDB(endpointSeguir));