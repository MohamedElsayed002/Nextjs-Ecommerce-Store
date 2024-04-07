

export async function isValidPassword(password : string, hashedPassword : string) {
    // password dksosdsko username mohamed
    // console.log(await hashPassword(password))
    return (await hashPassword(password)) === hashedPassword


}

async function hashPassword(password : string) {
    const arrayBuffer = await crypto.subtle.digest('SHA-512',new TextEncoder().encode(password))

    return Buffer.from(arrayBuffer).toString('base64')
}