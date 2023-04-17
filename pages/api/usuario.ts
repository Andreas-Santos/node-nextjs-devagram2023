import type {NextApiRequest, NextApiResponse} from 'next';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';

const endpointUsuario = (req : NextApiRequest, res : NextApiResponse) => {

    return res.status(200).json({msg : 'Usuário autenticado com sucesso'});
}

export default validarTokenJWT(endpointUsuario);