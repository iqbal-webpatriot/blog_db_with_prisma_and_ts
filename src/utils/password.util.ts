import bcrypt from 'bcryptjs'
const hashPassword = (password:string) => {
    return  bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

const comparePassword = (password:string, hash:any) => {
    return bcrypt.compareSync(password, hash);
}

export {hashPassword, comparePassword}
